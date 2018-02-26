// page/mine/mine.js
Page({
  data:{
    phone:'',
    cp:'',
    gs:''
  },
  goqhcl:function(){
    wx.removeStorageSync('plateNum')
    wx.removeStorageSync('orgName')
    wx.removeStorageSync('historyArray')
    wx.reLaunch({
      url: '../workingCar/workingCar',
    })
  },
  goLogin:function(){
    wx.showModal({
      title: '',
      content: '确认退出登录？',
      confirmColor:'#458cfa',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('account')
          wx.removeStorageSync('plateNum')
          wx.removeStorageSync('orgName')
          wx.removeStorageSync('truckData')
          wx.removeStorageSync('uId')
          wx.removeStorageSync('historyArray')
          wx.reLaunch({
            url: '../login/login'
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      phone: wx.getStorageSync('account'),
      cp: wx.getStorageSync('plateNum'),
      gs: wx.getStorageSync('orgName')
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})