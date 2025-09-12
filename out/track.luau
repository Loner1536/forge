-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local effect = TS.import(script, TS.getModule(script, "@rbxts", "vide").src).effect
local trackSources = {}
local parentMap = {}
local function track(mainComponent, parentComponent, visibleSource, parentVisibleSource)
	local _mainComponent = mainComponent
	local _visibleSource = visibleSource
	trackSources[_mainComponent] = _visibleSource
	if parentComponent then
		local _mainComponent_1 = mainComponent
		local _parentComponent = parentComponent
		parentMap[_mainComponent_1] = _parentComponent
	end
	effect(function()
		local isVisible = visibleSource()
		local _parentVisible = parentVisibleSource
		if _parentVisible ~= nil then
			_parentVisible = _parentVisible()
		end
		local parentVisible = _parentVisible
		-- Rule 1: Cannot be visible if parent exists and is not visible
		print(parentVisibleSource and not parentVisible and isVisible)
		if parentVisibleSource and not parentVisible and isVisible then
			print(`[Auto-GUI] Hiding {mainComponent.Name} because its parent is not visible`)
			visibleSource(false)
			return nil
		end
		-- Rule 2: Cannot be visible if it has children
		for child, childSource in trackSources do
			if parentMap[child] == mainComponent and childSource() then
				if isVisible then
					visibleSource(false)
				end
				return nil
			end
		end
		-- Rule 3: If visible, hide all unrelated siblings
		if isVisible and (parentVisibleSource == nil or parentVisible) then
			task.defer(function()
				for otherComponent, otherSource in trackSources do
					local isChildOfUs = parentMap[otherComponent] == mainComponent
					if otherComponent ~= mainComponent and otherComponent ~= parentComponent and not isChildOfUs and otherSource() then
						otherSource(false)
					end
				end
			end)
		end
	end)
	return visibleSource
end
return {
	default = track,
}
