# Vue.js2+OpenLayers6 三、添加自定义矢量标注

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h30vqky930j216i0u049n.jpg)

[Demo](https://liuzhenghe30265.github.io/openlayers6-vue2-demo)

[Github](https://github.com/liuzhenghe30265/openlayers6-vue2-demo)

# 示例

```vue
<template>
	<div id="map-container" style="width:100%;height:100%;">
		<div style="position:absolute;right:50px;top:50px;z-index:999;">
			<button @click="addSymbolMarkers(markersData)">添加标注</button>
			<button @click="removeLayerByName('矢量标注图层')">清除</button>
		</div>
	</div>
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

import OlFeature from 'ol/Feature'
import OlGeomPoint from 'ol/geom/Point'
import OlLayerVector from 'ol/layer/Vector'
import OlSourceVector from 'ol/source/Vector'
import OlStyleStyle from 'ol/style/Style'
import OlStyleIcon from 'ol/style/Icon'
import OlStyleText from 'ol/style/Text'
import OlStyleFill from 'ol/style/Fill'
import OlStyleStroke from 'ol/style/Stroke'

export default {
	name: 'CustomSymbols',
	data() {
		return {
			map: null,
			markersData: [
				{
					address: 'marker1',
					x: 116.40182752977934,
					y: 39.92476619935702,
					type: 1,
				},
				{
					address: 'marker2',
					x: 116.42764915596571,
					y: 39.949683921105375,
					type: 2,
				},
				{
					address: 'marker3',
					x: 116.48107607733336,
					y: 39.88376327014636,
					type: 2,
				},
				{
					address: 'marker4',
					x: 116.34883914958563,
					y: 39.96384062028598,
					type: 3,
				},
				{
					address: 'marker5',
					x: 116.3174412108573,
					y: 39.86192606545161,
					type: 3,
				},
			],
		}
	},
	mounted() {
		this.initMap()
	},
	methods: {
		/**
		 * @name: 根据图层名移除图层
		 * @param {layername} 图层名称
		 */
		removeLayerByName(layerName) {
			this.getLayerByName(layerName)
			const layer = this.getLayerByName(layerName)
			layer.forEach(item => {
				this.map.removeLayer(item)
			})
		},

		/**
		 * @name: 根据图层名获取图层
		 * @param {layerName} 图层名称
		 */
		getLayerByName(layerName) {
			const allLayers = this.getAllLayers()
			const layer = allLayers.filter(item => {
				return item.get('name') === layerName
			})
			return layer
		},

		/**
		 * @name: 获取所有图层
		 */
		getAllLayers() {
			const layers = this.map.getLayers().getArray()
			return layers
		},

		/**
		 * @name: 设置标注文字样式
		 * @param {text}
		 * @param {img}
		 */
		setSymbolStyle(text, img) {
			const Styles = []
			Styles.push(
				new OlStyleStyle({
					// 设置图标
					image: new OlStyleIcon({
						src: img,
						anchor: [0.5, 1],
						scale: 0.5,
					}),
					// 设置图片下面显示字体的样式和内容
					text: new OlStyleText({
						font: '14px sans-serif', // 设置字体
						maxAngle: 30,
						offsetx: 10, // 设置文字偏移量
						offsetY: 10,
						text: text, // 文字描述
						fill: new OlStyleFill({
							// 字体颜色
							color: '#000',
						}),
						stroke: new OlStyleStroke({
							// 文字描边
							color: '#fff',
							width: 5,
						}),
					}),
				})
			)
			return Styles
		},

		/**
		 * @name: 添加自定义矢量标注
		 * @param {data} Array
		 */
		addSymbolMarkers(data) {
			let img = ''
			const vectorLayer = new OlLayerVector({
				source: new OlSourceVector(),
				zIndex: 9,
				name: '矢量标注图层',
			})
			this.map.addLayer(vectorLayer)
			const features = []
			for (let i = 0; i < data.length; i++) {
				if (data[i].type === 1) {
					img = require('@/assets/images/ico01.png')
				} else if (data[i].type === 2) {
					img = require('@/assets/images/ico02.png')
				} else {
					img = require('@/assets/images/ico03.png')
				}
				// 创建 Feature
				const feature = new OlFeature({
					geometry: new OlGeomPoint([data[i].x, data[i].y]),
					data: data[i], // 数据存储到 feature 中用来做点击事件
				})
				feature.setStyle(this.setSymbolStyle(data[i].address, img)) // 设置样式
				features.push(feature)
			}
			vectorLayer.getSource().addFeatures(features)
		},

		/**
		 * @name: 地图单击事件
		 */
		singleClickFun() {
			this.map.on('singleclick', event => {
				console.log(event)
				const geoServer = false
				if (geoServer) {
					// 如果是 GeoServer 发布的 wms 服务做点击事件
					const LAYERS = 'DLQ:DLQYYCOMMUNITY,DLQ:DLQYYGRID,DLQ:DLQFHR,DLQ:DLQWGGLY' // 存在多图层，query 中添加多个图层的名称
					const viewResolution = this.map.getView().getResolution()
					const wmsSource = new TileWMS({
						url: 'http://******/geoserver/wms',
						params: { LAYERS: LAYERS, TILED: true },
						serverType: 'geoserver',
						transition: 0,
					})
					const url = wmsSource.getFeatureInfoUrl(
						event.coordinate,
						viewResolution,
						'EPSG:4326',
						{ INFO_FORMAT: 'application/json' }
					)
					if (this.map.hasFeatureAtPixel(event.pixel)) {
						if (url) {
							fetch(url)
								.then(response => {
									return response.json()
								})
								.then(data => {
									console.log(data)
								})
						}
					} else {
						// GetFeatureInfo
						if (url) {
							fetch(url)
								.then(response => {
									return response.json()
								})
								.then(data => {
									console.log(data)
								})
						}
					}
				} else {
					// 添加标注时添加的数据
					// let pixel = this.map.getEventPixel(event.originalEvent)
					const feature = this.map.forEachFeatureAtPixel(
						event.pixel,
						// eslint-disable-next-line no-unused-vars
						(feature, layer) => {
							return feature
						}
					)
					if (feature) {
						// 点击到标注
						const symbolData = feature.get('data')
						console.log(symbolData)
					}
				}
			})
		},

		/**
		 * @name: 初始化地图
		 */
		initMap() {
			const view = new View({
				projection: 'EPSG:4326',
				center: [116.395645038, 39.9299857781],
				zoom: 12,
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
			this.singleClickFun()
		},
	},
}
</script>
```
