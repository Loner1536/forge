-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
-- Packages
local Vide = TS.import(script, TS.getModule(script, "@rbxts", "vide").src)
-- Types
-- Components
local track = TS.import(script, script, "track").default
-- Vide Components
local _binding = Vide
local source = _binding.source
local mount = _binding.mount
local apply = _binding.apply
local effect = _binding.effect
local spring = _binding.spring
-- Module variables
local rendered = false
local canvasFolder
local function setupCanvasComponent(cfg)
	local _component = cfg.component
	assert(_component, "[Forge Setup] 'component' is required in config")
	local _visible = cfg.visible
	assert(_visible, "[Forge Setup] 'visible' source is required in config")
	local _args = cfg.args
	assert(_args, "[Forge Setup] 'args' is required in config")
	local component = cfg.component
	local componentArgs = cfg.args or {}
	local parentConfig = cfg.parent
	local visibleSource = cfg.visible
	local _parentComponent = parentConfig
	if _parentComponent ~= nil then
		_parentComponent = _parentComponent.component
	end
	local parentComponent = _parentComponent
	local _result = parentConfig
	if _result ~= nil then
		_result = _result.args
	end
	local _condition = _result
	if _condition == nil then
		_condition = {}
	end
	local parentArgs = _condition
	local mainComponent = component(unpack(componentArgs))
	if cfg.window then
		local _result_1 = parentConfig
		if _result_1 ~= nil then
			_result_1 = _result_1.original
		end
		local _exp = cfg.visible
		local _result_2 = parentConfig
		if _result_2 ~= nil then
			_result_2 = _result_2.visible
		end
		track(mainComponent, _result_1, _exp, _result_2)
	end
	local parentClone
	if parentComponent then
		parentClone = parentComponent(unpack(parentArgs))
		local _result_1 = parentClone
		if _result_1 ~= nil then
			local _exp = _result_1:GetChildren()
			-- ▼ ReadonlyArray.forEach ▼
			local _callback = function(child)
				return child:Destroy()
			end
			for _k, _v in _exp do
				_callback(_v, _k - 1, _exp)
			end
			-- ▲ ReadonlyArray.forEach ▲
		end
	end
	local canvas
	local springVisibility = spring(function()
		return if visibleSource() then 0 else 1
	end, cfg.fadeSpeed, 0.8)
	local isSpringOpen = source(false)
	local wasFullyClosed = source(false)
	task.defer(function()
		local containPosInHierarchy = mainComponent.Parent
		mount(function()
			canvas = (Vide.jsx("canvasgroup", {
				Name = mainComponent.Name,
				BackgroundTransparency = 1,
				GroupTransparency = springVisibility,
				AnchorPoint = Vector2.new(0.5, 0.5),
				Position = UDim2.fromScale(0.5, 0.5),
				Size = UDim2.fromScale(1, 1),
				Interactable = false,
				ZIndex = function()
					if cfg.parent then
						return 2
					end
					local _value = visibleSource() and cfg.zIndex
					if _value ~= 0 and _value == _value and _value then
						return cfg.zIndex
					end
					if visibleSource() and cfg.window then
						return 3
					end
					if not visibleSource() and cfg.window then
						return 2
					end
					return 1
				end,
				Parent = canvasFolder,
			}))
			effect(function()
				local vis = springVisibility()
				local visible = visibleSource()
				if vis < 0.3 then
					isSpringOpen(true)
					wasFullyClosed(false)
				else
					isSpringOpen(false)
				end
				if vis >= 1 and not wasFullyClosed() then
					wasFullyClosed(true)
					if cfg.fullyClosed then
						task.spawn(cfg.fullyClosed)
					end
				end
				if not visible then
					mainComponent.Parent = parentClone or canvas
				elseif visible and isSpringOpen() then
					local _result_1 = parentConfig
					if _result_1 ~= nil then
						_result_1 = _result_1.original
					end
					local _condition_1 = _result_1
					if _condition_1 == nil then
						_condition_1 = containPosInHierarchy
					end
					mainComponent.Parent = _condition_1
				end
			end)
			return canvas
		end)
		if parentClone then
			parentClone.Name = "Parent Imitation"
			parentClone.Parent = canvas
			mainComponent.Parent = parentClone
		else
			mainComponent.Parent = canvas
		end
	end)
	apply(mainComponent)({
		Visible = function()
			return springVisibility() < 0.9
		end,
		ZIndex = function()
			if cfg.parent then
				return 2
			end
			local _value = visibleSource() and cfg.zIndex
			if _value ~= 0 and _value == _value and _value then
				return cfg.zIndex
			end
			if visibleSource() and cfg.window then
				return 3
			end
			if not visibleSource() and cfg.window then
				return 2
			end
			return 1
		end,
	})
	return mainComponent
end
local Forge = {
	add = function(self, config)
		local _config = config
		local _arg0 = type(_config) == "table"
		assert(_arg0, "[Forge] Expected a config table as the first argument.")
		local _rendered = rendered
		assert(_rendered, "[Forge] Forge.render() must be called before creating components.")
		local _canvasFolder = canvasFolder
		assert(_canvasFolder, "[Forge] canvasFolder not initialized. Call Forge.render() first.")
		return setupCanvasComponent(config)
	end,
	render = function(self, gui)
		local _arg0 = not rendered
		assert(_arg0, "[Forge.render] Forge.render() cannot be called more than once.")
		local _gui = gui
		assert(_gui, "[Forge.render] A GuiObject or ScreenGui must be provided.")
		if not gui:IsA("GuiObject") and not gui:IsA("ScreenGui") then
			error("[Forge.render] Argument must be a GuiObject or ScreenGui.")
		end
		rendered = true
		canvasFolder = (Vide.jsx("folder", {
			Name = "CanvasGroup Fades",
			Parent = gui,
		}))
	end,
}
local default = Forge
return {
	default = default,
}
