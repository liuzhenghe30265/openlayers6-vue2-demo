# Vue.js2+OpenLayers6 二、添加 GeoServer 发布的 wms 服务

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h30vpn2wdjj216i0u044l.jpg)

[Demo](https://liuzhenghe30265.github.io/openlayers6-vue2-demo)

[Github](https://github.com/liuzhenghe30265/openlayers6-vue2-demo)

# 示例

```vue
<template>
	<div id="map-container" style="width:100%;height:100%;" />
</template>
<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import OSM from 'ol/source/OSM'
import { defaults as defaultControls } from 'ol/control'
import ZoomSlider from 'ol/control/ZoomSlider'

export default {
	name: 'GeoServer',
	data() {
		return {
			map: null,
		}
	},
	mounted() {
		this.initMap()
	},
	methods: {
		/**
		 * @name: 地图单击事件
		 */
		singleClickFun() {
			this.map.on('singleclick', event => {
				console.log(event)
				// GetFeatureInfo
				const view = this.map.getView()
				const wmsSource = new TileWMS({
					url: 'https://ahocevar.com/geoserver/wms',
					params: { LAYERS: 'topp:states', TILED: true },
					serverType: 'geoserver',
					transition: 0,
				})
				const viewResolution = view.getResolution()
				const url = wmsSource.getFeatureInfoUrl(
					event.coordinate,
					viewResolution,
					'EPSG:4326',
					{ INFO_FORMAT: 'application/json' }
				)
				if (url) {
					fetch(url)
						.then(response => {
							return response.json()
						})
						.then(data => {
							console.log(data)
						})
				}
			})
		},

		/**
		 * @name: 初始化地图
		 */
		initMap() {
			const view = new View({
				projection: 'EPSG:4326',
				center: [-101.44058, 39.816105],
				zoom: 5,
			})
			const layer = new TileLayer({
				source: new OSM(),
				visible: true,
				zIndex: 1,
				name: 'OSM',
			})
			this.map = new Map({
				layers: [],
				target: 'map-container',
				view: view,
				controls: defaultControls().extend([new ZoomSlider()]),
			})
			this.map.addLayer(layer)

			// 加载 GeoServer 发布的 wms 服务
			const wmsLayer = new TileLayer({
				source: new TileWMS({
					url: 'https://ahocevar.com/geoserver/wms', // geoserver 服务地址
					params: { LAYERS: 'topp:states', TILED: true },
					serverType: 'geoserver',
					transition: 0,
				}),
				visible: true,
				zIndex: 9,
				className: 'wms',
			})
			this.map.addLayer(wmsLayer)

			this.singleClickFun()
		},
	},
}
</script>
```
