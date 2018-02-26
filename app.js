const openIdUrl = require('./config').openIdUrl

App({
  onLaunch: function () {
    var self = this
    this.getPostion();
    //测试
    //登录态过期
    //检验登录
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          console.log(res.code)
          wx.request({
            url: "http://localhost:8088/YL_SCDG/wxMina/getSessionKey.do",
            data: {
              code: res.code
            },
            success: function (res) {
              if (res.data.success) {
                console.log(res.data)
                //保存登录信息
                wx.setStorageSync('sessionKey', res.data.sessionkey)
                //获取用户信息
                wx.getUserInfo({
                  success: function (res) {
                    var userInfo = res.userInfo
                    wx.setStorageSync('userInfo', res.userInfo)
                  }
                })
              }
              else {
                wx.showModal({ title: "标题", content: "获取不到用户信息" })
                return
              }
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  globalData: {
    hasLogin: false,
    openid: null,
    thsPosition: '定位中…',
    requestBaseUrl: "http://itmstest.pgl-world.com.cn:8888" 
  },
  // lazy loading openid
  getUserOpenId: function(callback) {
    var self = this
    if (self.globalData.openid) {
      callback(null, self.globalData.openid)
    } else {
      wx.login({
        success: function(data) {
          wx.request({
            url: openIdUrl,
            data: {
              code: data.code
            },
            success: function(res) {
              console.log('拉取openid成功', res)
              self.globalData.openid = res.data.openid
              callback(null, self.globalData.openid)
            },
            fail: function(res) {
              console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
              callback(res)
            }
          })
        },
        fail: function(err) {
          console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
          callback(err)
        }
      })
    }
  },
  iconColor:{
      success:'#5ab601',
      info:'#4089fe',
      primaryWarn:'#fdbd00',
      warn:'#ec412c',
      waiting:'#4089fe',
      error:'#f43530',
      switchColor:'#fbbc00',
      circle:'#c9c9c9',
      success_no_circle:'#4089fe',
      info_circle:'#4089fe',
      cancel:'#a0a1a7'
  },
  //地址定位
  getPostion: function (e) {
    var ths = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var dizhi = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=CJTBZ-RIRRO-T55WE-SRRVH-FHDG5-G2FE6';
        wx.request({
          url: dizhi, //仅为示例，并非真实的接口地址
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            //console.log(this)
            ths.globalData.thsPosition = res.data.result.address_component.district;
          }
        })
      }
    })
  },
  //一键提货 在途ID&司机ID
  onPick:function(orderId,uId){
    var baseUrl = this.data.globalData.requestBaseUrl
    wx.request({
      url: baseUrl+"onPick.do",
      data:{
        orderId: orderId,
        uId:uId,
        uploadTruckingNumber:"",
        uType:"d"
      },
      success:function(res){
        return res.data
      },
      fail:function(res){
        return ""
      }
    })
  },

  //送达 在途ID&司机ID
  onArrive: function (jsondata) {
    wx.request({
      url: self.globalData.requestBaseUrl +"/wxMina/onArrive.do",
      data: {
        jsondata: jsondata,
      },
      success: function (res) {
        return res.data
      },
      fail: function (res) {
        return ""
      }
    })
  }
})

