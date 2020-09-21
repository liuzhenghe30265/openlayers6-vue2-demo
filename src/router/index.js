import Vue from 'vue'
import VueRouter from 'vue-router'
import InitMap from '@/components/InitMap'
import GeoServer from '@/components/modules/GeoServer'
import CustomSymbols from '@/components/modules/CustomSymbols'
import Overlay from '@/components/modules/Overlay'
import Measure from '@/components/modules/Measure'
import Plotting from '@/components/modules/Plotting'
import Heatmap from '@/components/modules/Heatmap'
import Cluster from '@/components/modules/Cluster'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: '初始化',
    component: InitMap
  },
  {
    path: '/GeoServer',
    name: 'GeoServer',
    component: GeoServer
  },
  {
    path: '/CustomSymbols',
    name: '自定义矢量标注',
    component: CustomSymbols
  },
  {
    path: '/Overlay',
    name: '覆盖物图层',
    component: Overlay
  },
  {
    path: '/Plotting',
    name: '标绘',
    component: Plotting
  },
  {
    path: '/Measure',
    name: '空间测量',
    component: Measure
  },
  {
    path: '/Heatmap',
    name: '热力图',
    component: Heatmap
  },
  {
    path: '/Cluster',
    name: '聚合',
    component: Cluster
  },
]

const router = new VueRouter({
  routes
})

export default router