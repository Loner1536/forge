-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
-- Packages
local Vide = TS.import(script, TS.getModule(script, "@rbxts", "vide").src)
-- Types
-- Components
local track = TS.import(script, script, "track").default
local _binding = Vide
local source = _binding.source
local mount = _binding.mount
local apply = _binding.apply
local effect = _binding.effect
local spring = _binding.spring
local function setupCanvasComponent(forge, cfg, parent)
	local _component = cfg.component
	assert(_component, "[Forge] 'component' is required in config")
	local _visible = cfg.visible
	assert(_visible, "[Forge] 'visible' source is required in config")
	local component = cfg.component
	local componentArgs = cfg.args or {}
	local visibleSource = cfg.visible
	local mainComponent = component(unpack(componentArgs))
	-- If parent was passed, mount under it later
	if cfg.window and parent then
		track(mainComponent, parent, cfg.visible, cfg.visible)
	end
	local _exp = function()
		return if visibleSource() then 0 else 1
	end
	local _value = cfg.fadeSpeed
	local springVisibility = spring(_exp, if _value ~= 0 and _value == _value and _value then cfg.fadeSpeed else forge._defaultFadeSpeed(), 0.8)
	local isSpringOpen = source(false)
	local wasFullyClosed = source(false)
	task.defer(function()
		local containPosInHierarchy = mainComponent.Parent
		mount(function()
			local canvas = (Vide.jsx("canvasgroup", {
				Name = mainComponent.Name,
				BackgroundTransparency = 1,
				GroupTransparency = springVisibility,
				AnchorPoint = Vector2.new(0.5, 0.5),
				Position = UDim2.fromScale(0.5, 0.5),
				Size = UDim2.fromScale(1, 1),
				Interactable = false,
				ZIndex = function()
					local _value_1 = visibleSource() and cfg.zIndex
					if _value_1 ~= 0 and _value_1 == _value_1 and _value_1 then
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
				Parent = forge.canvasFolder,
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
					mainComponent.Parent = canvas
				elseif visible and isSpringOpen() then
					mainComponent.Parent = containPosInHierarchy
				end
			end)
			return canvas
		end)
		mainComponent.Parent = mainComponent.Parent or forge.canvasFolder
	end)
	apply(mainComponent)({
		Visible = function()
			return springVisibility() < 0.9
		end,
		ZIndex = function()
			local _value_1 = visibleSource() and cfg.zIndex
			if _value_1 ~= 0 and _value_1 == _value_1 and _value_1 then
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
	-- Recursively set up children
	if cfg.children then
		for _, child in cfg.children do
			setupCanvasComponent(forge, child, mainComponent)
		end
	end
	return mainComponent
end
local Forge
do
	Forge = setmetatable({}, {
		__tostring = function()
			return "Forge"
		end,
	})
	Forge.__index = Forge
	function Forge.new(...)
		local self = setmetatable({}, Forge)
		return self:constructor(...) or self
	end
	function Forge:constructor(configs, gui, defaultFadeSpeed)
		if defaultFadeSpeed == nil then
			defaultFadeSpeed = 0.25
		end
		self.rendered = false
		self.components = {}
		self._defaultFadeSpeed = source(defaultFadeSpeed)
		self:render(gui)
		for _, cfg in configs do
			self:setupComponent(cfg)
		end
	end
	function Forge:setupComponent(cfg, parent)
		local comp = setupCanvasComponent(self, cfg, parent)
		-- store by the GuiObject's Name
		self.components[comp.Name] = comp
		-- recursively handle children
		if cfg.children then
			for _, child in cfg.children do
				self:setupComponent(child, comp)
			end
		end
		return comp
	end
	function Forge:get(name)
		return self.components[name]
	end
	function Forge:fadeSpeed(value)
		self._defaultFadeSpeed(value)
	end
	function Forge:render(gui)
		local _arg0 = not self.rendered
		assert(_arg0, "[Forge.render] Cannot be called more than once per Forge instance.")
		local _gui = gui
		assert(_gui, "[Forge.render] A GuiObject or ScreenGui must be provided.")
		if not gui:IsA("GuiObject") and not gui:IsA("ScreenGui") then
			error("[Forge.render] Argument must be a GuiObject or ScreenGui.")
		end
		self.rendered = true
		self.canvasFolder = (Vide.jsx("folder", {
			Name = "CanvasGroup Fades",
			Parent = gui,
		}))
	end
end
return {
	Forge = Forge,
}
