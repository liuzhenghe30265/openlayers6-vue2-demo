# Vue.js2+OpenLayers6 八、聚合

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h30vxdk3b5j216i0u0k11.jpg)

[Demo](https://liuzhenghe30265.github.io/openlayers6-vue2-demo)

[Github](https://github.com/liuzhenghe30265/openlayers6-vue2-demo)

# 示例

```vue
<template>
	<div id="map-container" style="width:100%;height:100%;">
		<div style="position:absolute;right:50px;top:50px;z-index:999;">
			<button @click="addClusterLayer(clusterData)">聚合</button>
			<button @click="removeLayerByName('聚合图层')">清除</button>
		</div>
	</div>
</template>
<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { defaults as defaultControls } from 'ol/control'
import ZoomSlider from 'ol/control/ZoomSlider'
import OlFeature from 'ol/Feature'
import OlGeomPoint from 'ol/geom/Point'
import OlSourceVector from 'ol/source/Vector'
import OlLayerVector from 'ol/layer/Vector'
import OlStyleStyle from 'ol/style/Style'
import OlStyleFill from 'ol/style/Fill'
import OlStyleStroke from 'ol/style/Stroke'
import OlStyleCircle from 'ol/style/Circle'
import OlStyleText from 'ol/style/Text'
import { Cluster } from 'ol/source'

export default {
	name: '',
	data() {
		return {
			// 聚合数据
			clusterData: [
				{
					name: '1',
					coordinates: [116.40182752977934, 39.92476619935702],
				},
				{
					name: '2',
					coordinates: [116.42764915596571, 39.949683921105375],
				},
				{
					name: '3',
					coordinates: [116.48107607733336, 39.88376327014636],
				},
				{
					name: '4',
					coordinates: [116.43154238235083, 39.94546346522044],
				},
				{
					name: '5',
					coordinates: [116.40311901342001, 39.92316223836612],
				},
				{
					name: '6',
					coordinates: [116.40436524149327, 39.92102890235143],
				},
			],
			map: null,
		}
	},
	mounted() {
		this.initMap()
	},
	methods: {
		/**
		 * @name: 鼠标悬浮改变聚合图标样式
		 */
		pointerMove() {
			const _this = this
			_this.map.on('pointermove', evt => {
				_this.map.getTargetElement().style.cursor = _this.map.hasFeatureAtPixel(evt.pixel)
					? 'pointer'
					: ''
			})
		},

		/**
		 * @name: 设置聚合图标样式
		 */
		setClusterStyle() {
			return feature => {
				const size = feature.get('features').length
				let color = ''
				if (size === 1) {
					color = 'green'
				} else if (size === 2) {
					color = 'yellow'
				} else {
					color = 'red'
				}
				const style = new OlStyleStyle({
					image: new OlStyleCircle({
						radius: 15,
						stroke: new OlStyleStroke({
							color: '#fff',
						}),
						fill: new OlStyleFill({
							color: color,
						}),
					}),
					text: new OlStyleText({
						text: size.toString(),
						fill: new OlStyleFill({
							color: '#000',
						}),
						stroke: new OlStyleStroke({
							color: '#fff',
							width: 5,
						}),
					}),
				})
				return style
			}
		},

		/**
		 * @name: 添加聚合图层
		 * @param {data} Array 聚合数据
		 * @return {type}
		 */
		addClusterLayer(data) {
			const _this = this
			const source = new OlSourceVector()
			const clusterSource = new Cluster({
				distance: parseInt(20, 10),
				source: source,
			})
			const layer = new OlLayerVector({
				source: clusterSource,
				style: _this.setClusterStyle.call(_this),
				name: '聚合图层',
				zIndex: 9,
			})
			_this.map.addLayer(layer)
			for (let i = 0; i < data.length; i++) {
				const coordinates = data[i].coordinates
				const feature = new OlFeature({
					geometry: new OlGeomPoint(coordinates),
				})
				feature.set('name', data[i].name)
				feature.set('value', data[i].value)
				feature.set('type', 'cluster')
				source.addFeature(feature)
				layer.getSource().addFeatures(feature)
			}
			_this.pointerMove()
		},

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
		 * @name: 地图单击事件
		 */
		singleClickFun() {
			this.map.on('singleclick', event => {
				console.log(event)
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
