var app = getApp()
var baseUrl = app.globalData.requestBaseUrl
Page({
  data: {
    number_login:false,
    phone_login:true,
    numBtn:true,
    phoneBtn:false,
    IdentifyingBtn:true,
    isClick:'',
    btnText:'获取验证码',
    disabled:true,
    countdown:'60',
    NumEyeSate:'eye_close',
    // PhoneEyeSate: 'eye_close',
    NumShow:true,
    PhoneShow:true,
    NumUserName:'',//账号登录账号
    NumUserPassword: '',//账号登录密码
    PhoneUserName:'',//手机验证登录账号
    PhoneUserPassword: ''//手机验证登录密码
  },
  //切换手机登录
  phoneLogin:function(e){
    this.setData({
      number_login: true,
      phone_login: false,
    })
  },
  //获取用户手机号
  getPhoneNumber: function (e) {
    var self = this
     var thisPhone = e.detail.encryptedData.phoneNumber;
     this.setData({
       PhoneUserName: thisPhone
     })
     var sessionkey = wx.getStorageSync("sessionKey")
     wx.request({
       url: baseUrl+'/wxMina/getUserDecrypt.do',
       data:{
         sSrc: e.detail.encryptedData,
         encodingFormat:'UTF-8',
         sKey: sessionkey,
         ivParameter: e.detail.iv,
       },
       success:function(res){
         if (res.data.purePhoneNumber!=""){
           self.setData({
             PhoneUserName: res.data.purePhoneNumber,
             IdentifyingBtn:false
           })
         }
       }
     })
     if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
       wx.showModal({
         title: '提示',
         showCancel: false,
         content: '未授权',
         success: function (res) { }
       })
     } else {
       wx.showModal({
         title: '提示',
         showCancel: false,
         content: '同意授权',
         success: function (res) { 
          console.log(res)
         }
       })
     }
  },  
  //切换账号登录
  onLoad:function(options){
    wx.getUserInfo({
      success: function (res) {
        console.log(res)
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女
        var province = userInfo.province
        var city = userInfo.city
        var country = userInfo.country
      }
    })
    var uId = wx.getStorageSync("uId")
    var plateNum = wx.getStorageSync("plateNum")
    if (uId != "" && uId != null && plateNum != "" && plateNum != null) {
      wx.reLaunch({
        url: '../home/home'
      })
    }
  },
  numberLogin:function(e){
    this.setData({
      number_login: false,
      phone_login: true,
      NumShowOrNo:true,//账号登录显示隐藏密码，true为隐藏
      PhoneShowOrNo: true//手机验证登
    })
  },
  //获取账号登录账号
  NumUserNameFun:function(e){
    var allHas = !(this.data.NumUserPassword && e.detail.value);
    this.setData({
      numBtn: allHas,
      NumUserName: e.detail.value
    })
  },
  //获取账号登录密码
  NumUserPasswordFun:function(e){
    var allHas = !(this.data.NumUserName && e.detail.value);
    this.setData({
      numBtn: allHas,
      NumUserPassword: e.detail.value
    })
  },
  //显示隐藏密码
  NumShowPassword:function(){
    var eye_close = this.data.NumEyeSate,
        eyeDate = (eye_close == "eye_close") ? 'eye_open' : 'eye_close',
        thsType = (eye_close == "eye_close") ? 'text': 'password' ;
    this.setData({
      NumEyeSate: eyeDate,
      NumShow: !(eye_close == "eye_close")
    })
  },
  //输入手机号码
  PhoneUserNameInput: function (e) {
    var IdentifyingBtn = true,
      val = e.detail.value;
    if (val.length == "11"){
      IdentifyingBtn = false;
      console.log(IdentifyingBtn);
    }
    this.setData({
      PhoneUserName:e.detail.value,
      IdentifyingBtn: IdentifyingBtn
    })  
  },
  //点击获取验证码
  getIdentifying: function (e) {
    var self = this
    //获取验证码短信
    wx.request({
      url: baseUrl + '/wxMina/getMailCode.do',
      data: {
        phoneNum: self.data.PhoneUserName,
      },
      success:function(res){
        if(res.data.code=="200"){
          wx.showToast({
            title: '获取成功',
            duration: 2000,
          })
          return
        }else{
          wx.showToast({
            title: '此司机不存在',
            duration: 2000,
            image: "../../images/error.png"
          })
          return
        }
      }
    })
    this.setData({
      isClick: 'clickClass',
      btnText: '60S可重新获取'
    })
    countdown(this);
  },
  //输入验证码
  PhoneUserPasswordInput:function(e){
    var allHas = !(this.data.PhoneUserName && e.detail.value && e.detail.value.length == 6);
    this.setData({
      PhoneUserPassword:e.detail.value,
      phoneBtn: allHas
    })
  },
  //清空文本输入
  clearNumInput: function (e) {
    var allHas = !(!this.data.NumUserPassword || !this.data.NumUserName);
    this.setData({
      numBtn: allHas, 
      NumUserName: ""
    })
  },
  clearPhoneInput: function (e) {
    this.setData({
      IdentifyingBtn: true,
      isClick: '',
      btnText: '获取验证码',
      countdown: '60',
      PhoneUserName: ""
    });
    clearInterval(thimer);
  },
  //登录按钮
  logInBut: function (e) {
    var self = this
    this.setData({
      NumUserPassword: "123456",
      NumUserName: "7697897"
    })
    //显示加载中
    wx.showLoading({
      title: '登录中',
      mask:true 
    })
    //用户名密码登录
    if (this.data.phone_login){
      if (self.data.NumUserName==""){
        wx.showToast({
          title: '请输入用户名',
          duration: 2000,
          image: "../../images/error.png"
        })
        return
      }
      if (self.data.NumUserPassword == "") {
        wx.showToast({
          title: '请输入密码',
          duration: 2000,
          image: "../../images/error.png"
        })
        return
      }      
      wx.request({
        url: baseUrl + "/wxMina/minaLogin.do",
        data:{
          account: this.data.NumUserName,
          userPassword: this.data.NumUserPassword
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.statusCode==404){
            wx.showToast({
              title: '网络错误',
              duration: 2000,
              image: "../../images/error.png"
            })
          }
          if (res.data.textMsg =='success'){
            wx.setStorageSync("account", self.data.NumUserName)
            wx.hideLoading()
            wx.reLaunch({ url: '../workingCar/workingCar'})
          }
          if (res.data.textMsg == 'pwdErr') {
            wx.showToast({
              title: '密码错误',
              duration: 2000,
              image: "../../images/error.png"
            })
          } 
          if (res.data.textMsg == 'noAccount') {
            wx.showToast({
              title: '账号错误',
              duration: 2000,
              image: "../../images/error.png"
            })
          }
        },
        fail:function (res){
          wx.showToast({
            title: '网络错误',
            duration: 2000,
            image: "../../images/error.png"
          })
        },
      })
    }
    //短信验证登录
    if (this.data.number_login) {
      wx.request({
        url: baseUrl + "/wxMina/minaMailLogin.do",
        data: {
          phoneNum: self.data.PhoneUserName,
          num: self.data.PhoneUserPassword
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.success) {
            wx.setStorageSync("account", "18023457953")
            wx.showToast({
              title: '登录成功',
              duration: 2000,
            })
            wx.reLaunch({ url: '../workingCar/workingCar' })
          }else{
            wx.showToast({
              title: '验证码错误',
              duration: 2000,
              image: "../../images/error.png"
            })
          }
        },
        complete: function (res) {
          wx.hideLoading()
        }
      })
    }
  },
  //短信登录按钮
  mailLogInBut:function(res){
    var self = this
    wx.request({
      url: "/wxMina/minaMailLogin.do",
      data: {
        phoneNum: self.data.PhoneUserName,
        num: self.data.PhoneUserPassword
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.success=="true") {
          wx.showToast({
            title: '登录成功',
            duration: 2000,
          })
          wx.setStorageSync("account", self.data.PhoneUserName)
          wx.reLaunch({ url: '../workingCar/workingCar' })
        } else {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            image: "../../images/error.png"
          })
        }
      },
      complete: function (res) {
      }
    })
  }
})

var thimer;
function countdown(ths){
  var thsCountdown;
  clearInterval(thimer);
      thimer = setInterval(function(){
      thsCountdown = parseInt(ths.data.countdown);
      if (thsCountdown == 1) {
        ths.setData({
          btnText: '重新获取',
          countdown:'60',
          isClick: ''
        })
        clearInterval(thimer);
        return;
      }
      ths.setData({
        btnText: (thsCountdown - 1) +'S可重新获取',
        countdown: thsCountdown - 1
      });
      console.log(thsCountdown);
      //countdown(that);  
  },1000)

}