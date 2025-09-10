-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
-- Packages
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
		if parentVisibleSource and not parentVisible and isVisible then
			visibleSource(false)
			return nil
		end
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
