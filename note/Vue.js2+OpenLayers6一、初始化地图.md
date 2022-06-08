# Vue.js2+OpenLayers6 一、初始化地图

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h30vnbhr45j216i0u0qdt.jpg)

[Demo](https://liuzhenghe30265.github.io/openlayers6-vue2-demo)

[Github](https://github.com/liuzhenghe30265/openlayers6-vue2-demo)

# OpenLayers

[OpenLayers](https://openlayers.org/en/latest/doc/) 中，图层使用 layer 对象表示：

![](https://tva1.sinaimg.cn/large/007S8ZIlly1gfixyur0m1j30do19st9j.jpg)

常用的有 Image（图片图层）、Tile（切片图层）、Vector（矢量图层）、Heatmap（热力图）。

# 安装 openlayer

```

npm install ol --save
```

# 初始化

环境

```
node V10.15.0
npm 6.4.1
```

初始化页面中添加 OpenLayers 需要的所有依赖，以及地图交互方法的封装，这里底图使用 OSM。

InitMap.vue

```vue
<template>
	<div id="map-container" style="width:100%;height:100%;" />
</template>
<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { ZoomToExtent, defaults as defaultControls } from 'ol/control'
// import Extent from 'ol/interaction/Extent'

export default {
	name: '',
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
				console.log(event.coordinate[0], event.coordinate[1])
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
				zIndex: 9,
				name: 'OSM',
			})
			this.map = new Map({
				layers: [],
				target: 'map-container',
				view: view,
				controls: defaultControls().extend([
					new ZoomToExtent({
						extent: [
							116.22979869019117,
							39.78578351593684,
							116.56048958074179,
							40.077314154870024,
						],
					}),
				]),
			})
			this.map.addLayer(layer)
			this.singleClickFun()
		},
	},
}
</script>

<style scoped lang="scss"></style>
```
