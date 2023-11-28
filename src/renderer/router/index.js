import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router =  new Router({
  scrollBehavior () {
    return { x: 0, y: 0 }
  },  
  mode: 'hash',
  routes: [
    {
      path: '/loading', name: 'loading', component: require("@/components/loading").default, 
    },
    {
      path: '/adminPage', name: 'AdminPage', component: require("@/components/AdminPage").default,
      children:[
        {
          path: '/survey', name: 'survey', component: require("@/components/AdminPage/survey").default
        },
        {
          path: '/measurements', name: 'measurements', component: require("@/components/AdminPage/measurements").default
        },
        {
          path: '/objects', name: 'objects', component: require("@/components/AdminPage/objects").default
        },
        {
          path: '/subjects', name: 'subjects', component: require("@/components/AdminPage/subjects").default
        },
        {
          path: '/hardware', name: 'hardware', component: require("@/components/AdminPage/hardware").default
        },
        {
          path: '/config', name: 'config', component: require("@/components/AdminPage/config").default
        }
      ]
    },
    {
      path: "/SurveyPage/:index", name: "SurveyPage", component: require("@/components/SurveyPage").default,
      children:[
        {
          path:"/question", name:"question", component: require("@/components/SurveyPage/question").default,
          children:[
            {
              path:"/yes-no", name:"yes-no", component: require("@/components/SurveyPage/question/yes-no").default
            },
            {
              path:"/checkbox", name:"checkbox", component: require("@/components/SurveyPage/question/checkbox").default
            },
            {
              path:"/radio", name:"radio", component: require("@/components/SurveyPage/question/radio").default
            },
            {
              path:"/slider", name:"slider", component: require("@/components/SurveyPage/question/slider").default
            },
            {
              path:"/matrix", name:"matrix", component: require("@/components/SurveyPage/question/matrix").default
            },
            {
              path:"/matrixCircle", name:"matrix_circle", component: require("@/components/SurveyPage/question/matrix_circle").default
            },
            {
              path:"/polygonGraph", name:"polygonGraph", component: require("@/components/SurveyPage/question/polygonGraph").default
            },
            {
              path:"/input", name:"input", component: require("@/components/SurveyPage/question/input").default
            },
            {
              path:"/select", name:"select", component: require("@/components/SurveyPage/question/select").default
            }
          ]
        },
        {
          path:"/freestyle", name:"freestyle", component: require("@/components/SurveyPage/freestyle").default
        },
        {
          path:"/explanation", name:"explanation", component: require("@/components/SurveyPage/explanation").default
        },
        {
          path:"/explanationPic", name:"explanationPic", component: require("@/components/SurveyPage/explanationPic").default
        },
        {
          path:"/timer", name:"timer", component: require("@/components/SurveyPage/timer").default
        },
        {
          path:"/manual", name:"manual", component: require("@/components/SurveyPage/manual").default
        },
        {
          path: "/welcome", name: "welcome", component: require("@/components/SurveyPage/welcome").default
        },
        {
          path: "/end", name: "end", component: require("@/components/SurveyPage/end").default
        },
      ]
    },
    {
      path: '*',
      redirect: '/loading'
    }
  ]
})

export default router;