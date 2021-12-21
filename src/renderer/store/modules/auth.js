
import axios from 'axios'

const state = {
    status: '',
    token: localStorage.getItem('token') || '',
    tokenReceived : Date.now(),
};

const getters = {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
    tokenReceived: state => state.tokenReceived
};

const mutations= {
    auth_request(state){
        state.status = 'loading'
      },
    auth_success(state, token){
        state.status = 'success'
        state.token = token
        state.tokenReceived = Date.now()
    },
    auth_error(state){
        state.status = 'error'
    },
    logout(state){
        state.status = ''
        state.token = ''
    },
};
const actions= {
    login ({commit}, user){
        return new Promise((resolve, reject) => {
            commit('auth_request')
            axios({url: "https://"+axios.defaults.baseURL+'/api/login', data: user, method: 'POST' }).then(resp => {
                const token = resp.data.token
                localStorage.setItem('token', token)
                axios.defaults.headers.common['Authorization'] = "Bearer "+token
                commit('auth_success', token)
                resolve(resp)
            }).catch(err => {
                commit('auth_error')
                localStorage.removeItem('token')
                reject(err)
            })
        })
    },
    register({commit}, user) {
        return new Promise((resolve, reject) => {
            commit('auth_request')
            axios({url: 'https://'+axios.defaults.baseURL+'/api/register', data: user}).then(resp => {
                const token = resp.data.token
                localStorage.setItem('token', token)
                axios.defaults.headers.common['Authorization'] = "Bearer "+token
                commit('auth_success', token)
                resolve(resp)
            }).catch(err => {
                commit('auth_error', err)
                localStorage.removeItem('token')
                reject(err)
            })
        })
      },
      logout({commit}){
        return new Promise((resolve) => {
          commit('logout')
          localStorage.removeItem('token')
          localStorage.removeItem('tokenReceived')
          delete axios.defaults.headers.common['Authorization']
          resolve()
        })
      },
      refresh({commit}) {
        return new Promise((resolve, reject) => {
            commit('auth_request')
            axios({url: 'https://'+axios.defaults.baseURL+'/api/refresh', method: 'POST' }).then(resp => {
                const token = resp.data.new_token
                localStorage.setItem('token', token)
                axios.defaults.headers.common['Authorization'] = "Bearer "+token
                commit('auth_success', token)
                resolve(resp)
            }).catch(err => {
                commit('auth_error', err)
                localStorage.removeItem('token')
                reject(err)
            })
        })
      },
};

export default {
    state,
    getters,
    actions,
    mutations
};