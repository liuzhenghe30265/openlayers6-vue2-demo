<template>
  <div
    id="map-container"
    style="width:100%;height:100%;" />
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
  data () {
    return {
      map: null
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    /**
     * @name: 地图单击事件
     */
    singleClickFun () {
      this.map.on('singleclick', event => {
        console.log(event)
        console.log(event.coordinate[0], event.coordinate[1])
      })
    },

    /**
     * @name: 初始化地图
     */
    initMap () {
      const view = new View({
        projection: 'EPSG:4326',
        center: [116.395645038, 39.9299857781],
        zoom: 12
      })
      const layer = new TileLayer({
        source: new OSM(),
        visible: true,
        zIndex: 9,
        name: 'OSM'
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
              40.077314154870024
            ]
          })
        ])
      })
      this.map.addLayer(layer)
      this.singleClickFun()
    }
  }
}
</script>

<style scoped lang="scss">
</style>
