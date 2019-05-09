
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      errMsg: "",
      cancelText: "",
      posterHeight: 520,
      posterWidth: 287,
      winHeight: 0,
      imgOuterTop: 5,
      // listHeight: 0,
      isHiddenImg: true,
      painting: {},
      shareImage: "",
      noMore: false,
      isRefresh: false,
      scrollTop: 0,
      pageSize: 10,
      page: 0, //可删
      pageCount: 1,
      total: 0,
      brandId: null,
      shopId: null,
      userInfo: {},
      tempShareImages: {},
      categories: [{
          id: 1,
          name: '全部'
      }, {
          id: 2,
          name: '拼团'
      }],

      isShowRank: false, //
      isShowCategory: false,
      categoryId: 1, //拼团、团购等分类查询
      categoryText: "全部",
      list: [],
      tradeCount: 0,
      tradeAmount: 0,
      rankNum: null,
      start: 0,
      end: 0,
      dateText: '今天',
      dateCode: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

      wx.getSystemInfo({
          success: (res) => {
              this.setData({
                  winHeight: res.windowHeight
              });
              //imgOuterTop
              if (res.windowHeight > this.data.posterHeight + 60) {
                  let top = (res.windowHeight - (this.data.posterHeight + 60)) / 2
                  if (top > 5) {
                      this.setData({
                          imgOuterTop: top
                      })
                  }

              }
          }
      })

     
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      // let query = wx.createSelectorQuery();
      // query.select('#toppane').boundingClientRect()
      // query.exec((res) => {
      //     let toppaneH = res[0].height; // 获取list高度
      //     let listHeight = this.data.winHeight - toppaneH;
      //     this.setData({
      //         listHeight: listHeight > 0 ? listHeight : 0
      //     });
      // })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    

  },


  eventGetImage: function (event) {
      wx.hideLoading()
      const {
          tempFilePath,
          customParam
      } = event.detail;
      let param = {
          shareImage: tempFilePath,
          isHiddenImg: false,

      }
      if (customParam) {
          param.tempShareImages = this.data.tempShareImages || {};
          param.tempShareImages[customParam] = tempFilePath;
      }
      this.setData(param)

  },
  onShare: function (e) {

      // app.getOpenId((res) => {
      //     if (res.success) {
      //         start({
      //             path: PATHS_ALIAS.WXA_SHOP_SAVE_FORMID,
      //             param: {
      //                 'formId': e.detail.formId,
      //                 'openId': res.openId
      //             },
      //             success: function (data) {

      //             }
      //         })
      //     }

      // })


      let userInfo = {shopName:'武林大厦店',name:'小红'};
      let goodsid = '112'
      let activityTag ="周年庆";
      let activitySlogan = "🎊🎊低至0.01元，限时抢购价值980元【三重面部护理】3次，遇见最美的自己！";
      let goodsName = '深层补水';
      let goodsOriginPrice = '100';
      let activityPrice = '80';
      let groupPersonNum ='小米';
      let goodsPicUrl = 'https://asset.imuge.net/Fszan0rnHIS_PMnEt2BpfnTUMXTL';
    //https://b-ssl.duitang.com/uploads/item/201904/16/20190416230816_L3NYs.thumb.400_0.jpeg
      let techMsg = ["【专属福利】" + activityPrice + "元超值购" + goodsName + "，仅限VIP客户购买。", "尊贵的VIP客户，我这里有" + activityPrice + "元购" + goodsName + "的机会送给您，叫上好友一起买更超值~"];
      let random = Math.floor(Math.random());
      let idx = random < 0.4 ? 0 : 1;
      let techMessage = techMsg[idx];
      let painting = {
          customParam: goodsid,
          width: this.data.posterWidth,
          height: this.data.posterHeight,
          clear: true,
          bgShape: 'roundRect', //roundRect  round,
          bgFillStyle: '#ffffff',
          views: [{ //1 商店icon
                  type: 'text_icon',
                  content: userInfo.shopName,
                  fontSize: 16,
                  color: '#333333',
                  textAlign: 'center',
                  top: 12,
                  left: 150,
                  lineHeight: 20,
                  MaxLineNumber: 1,
                  breakWord: true,
                  width: 270,
                  // bolder:true,
                  icon: {
                      url: '/static/shop_icon.png',
                      width: 17,
                      height: 16,
                      type: 'prefix', //suffix  prefix 
                      iconTop: 4, //相对于文本的
                      iconRight: 2
                  },
                  range: {
                      row: 1,
                      col: 1
                  }
              },
              { 
                  type: 'text',
                  content: userInfo.shopName,
                  fontSize: 16,
                  color: '#333333',
                  textAlign: 'center',
                  top: 13.3,
                  left: 159.7,
                  lineHeight: 20,
                  MaxLineNumber: 1,
                  breakWord: true,
                  width: 270,

                  range: {
                      row: 1,
                      col: 2
                  }
              },
              { //2 商品图片
                  type: 'image',
                  url: goodsPicUrl,
                  top: 42,
                  left: 0,
                  width: this.data.posterWidth,
                  height: 287,
                  mode: 'aspectFill',
                  range: {
                      row: 2,
                      col: 1
                  }
              },
              { //3 活动标签 背景
                  type: 'roundRect',
                  fillStyle: '#F24D3D',
                  radius: 6,
                  height: 14,
                  left: 9,
                  top: 7,
                  measure: {
                      to: 'width',
                      content: activityTag,
                      fontSize: 10,
                      otherWidth: 8, //自适应文本宽度再加4
                      // maxWidth:''
                      // content: '“' + techMessage + '”',
                      // width: 198, //应小于230
                      // MaxLineNumber: 3, //自适应小于等于3行
                      // lineHeight: 16,
                      // otherHeight: 12,
                      // fontSize: 12
                  },
                  range: {
                      row: 3,
                      col: 1,
                      referRow: 2, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },
              { //4 活动标签 文本
                  type: 'text',
                  content: activityTag,
                  fontSize: 10,
                  left: 13,
                  top: 7,
                  color: "#ffffff",
                  //bgShape:'',
                  range: {
                      row: 3,
                      col: 2,
                      referRow: 2, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }

              },
              { //4 活动标签 文本
                  type: 'text',
                  content: activityTag,
                  fontSize: 10,
                  left: 13.2,
                  top: 7.3,
                  color: "#ffffff",
                  //bgShape:'',
                  range: {
                      row: 3,
                      col: 3,
                      referRow: 2, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }

              },
              { //5 活动标语
                  type: 'text',
                  content: (activitySlogan != null ? activitySlogan : ""),
                  fontSize: 14,
                  color: '#333333',
                  textAlign: 'left',
                  bold: true,
                  top: 5,
                  left: 10,
                  lineHeight: 18,
                  MaxLineNumber: 2,
                  breakWord: true,
                  width: 250,
                  indent: {
                      content: activityTag,
                      fontSize: 10,
                      otherWidth: 10, //自适应文本宽度再加4
                  },
                  range: {
                      row: 3,
                      col: 4,
                      referRow: 2, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },
              { //5 活动标语
                  type: 'text',
                  content: (activitySlogan != null ? activitySlogan : ""),
                  fontSize: 14,
                  color: '#333333',
                  textAlign: 'left',
                  bold: true,
                  top: 5.3,
                  left: 10.2,
                  lineHeight: 18,
                  MaxLineNumber: 2,
                  breakWord: true,
                  width: 250,
                  indent: {
                      content: activityTag,
                      fontSize: 10,
                      otherWidth: 10, //自适应文本宽度再加4
                  },
                  range: {
                      row: 3,
                      col: 5,
                      referRow: 2, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },

              { //6 商品名称  goodsName
                  type: 'text',
                  content: (goodsName != null ? goodsName : ""),
                  fontSize: 13,
                  color: '#666666',
                  textAlign: 'left',
                  top: 25,
                  left: 0,
                  lineHeight: 16,
                  MaxLineNumber: 1,
                  breakWord: true,
                  width: 174,
                  // bolder:true,
                  range: {
                      row: 4,
                      col: 1,
                      referRow: 3, //参照的行,只有行则相对于第二行的左下角
                      referCol: 4,
                      referAlign: 'leftBottom'

                  }
              },
              { //7 价格符号
                  type: 'text',
                  content: '￥',
                  fontSize: 14,
                  color: '#EF260E',
                  textAlign: 'left',
                  top: 14,
                  left: 0,
                  lineHeight: 20,
                  breakWord: true,
                  width: 20,
                  range: {
                      row: 5,
                      col: 1,
                      referRow: 4, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },
              { //7 价格符号
                  type: 'text',
                  content: '￥',
                  fontSize: 14,
                  color: '#EF260E',
                  textAlign: 'left',
                  top: 14.3,
                  left: 0.2,
                  bold: true,
                  lineHeight: 20,
                  MaxLineNumber: 2,
                  breakWord: true,
                  width: 20,
                  range: {
                      row: 5,
                      col: 2,
                      referRow: 4, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },
              { //8 活动价格
                  type: 'text',
                  content: activityPrice + '',
                  fontSize: 18,
                  color: '#EF260E',
                  textAlign: 'left',
                  top: 10,

                  left: 14,
                  lineHeight: 20,
                  breakWord: true,
                  width: 120,
                  range: {
                      row: 5,
                      col: 3,
                      referRow: 4, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },
              { //8 活动价格
                  type: 'text',
                  content: activityPrice + '',
                  fontSize: 18,
                  color: '#EF260E',
                  textAlign: 'left',
                  top: 10.3,

                  left: 14.2,
                  lineHeight: 20,
                  breakWord: true,
                  width: 120,
                  range: {
                      row: 5,
                      col: 4,
                      referRow: 4, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftBottom'
                  }
              },
              { //9  原始价格
                  type: 'text',
                  content: '￥' + goodsOriginPrice,
                  fontSize: 13,
                  color: '#999999',
                  textAlign: 'left',
                  top: 4,
                  left: 6,
                  lineHeight: 20,
                  MaxLineNumber: 2,
                  breakWord: true,
                  width: 120,
                  textDecoration: "line-through",
                  range: {
                      row: 5,
                      col: 5,
                      referRow: 5, //参照的行,只有行则相对于第二行的左下角
                      referCol: 4,
                      referAlign: 'rightTop'
                  }
              },
              { //10 二维码
                  type: 'image',
                  url: 'https://asset.imuge.net/jishi_test_qrcode.jpg',
                  top: 1,
                  left: 185,
                  width: 72,
                  height: 72,
                  mode: 'aspectFill',
                  // bgShape: 'round',
                  range: {
                      row: 4,
                      col: 2,
                      referRow: 3, //参照的行,只有行则相对于第二行的左下角
                      referCol: 4,
                      referAlign: 'leftBottom'
                  }

              },
              { //11 二维码提示
                  type: 'text',
                  content: '长按扫码抢购',
                  fontSize: 10,
                  color: '#666666',
                  textAlign: 'center',
                  top: 2,
                  left: 36,
                  lineHeight: 20,
                  MaxLineNumber: 1,
                  breakWord: true,
                  width: 80,
                  range: {
                      row: 5,
                      col: 4,
                      referRow: 4, //参照的行,只有行则相对于第二行的左下角
                      referCol: 2,
                      referAlign: 'leftBottom'
                  }
              },
              { //12 底部底图
                  type: 'image',
                  url: 'https://asset.imuge.net/FsRRlaK9Uig5pmWcBH2bSg1yXPAZ',
                  top: 461,
                  left: 0,
                  width: 287,
                  height: 59,
                  mode: 'aspectFit',
                  bgShape: 'roundRect',
                  borderRadius: [0, 0, 5, 5],
                  range: {
                      row: 6,
                      col: 1,
                  }
              },
              { //13 头像
                  type: 'image',
                  url: 'https://asset.imuge.net/FpndfxCTwD3aAa4MTBDcfk-7w0OI',
                  top: 5,
                  left: 10,
                  width: 32,
                  height: 32,
                  mode: 'aspectFit',
                  bgShape: 'round',
                  range: {
                      row: 7,
                      col: 1,
                      referRow: 6, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftTop'
                  }

              },
              { //14 名字
                  type: 'text',
                  content: userInfo.name,
                  fontSize: 12,
                  color: '#ffffff',
                  //textAlign: 'center',
                  top: 3,
                  left: 48,
                  lineHeight: 12,
                  MaxLineNumber: 1,
                  breakWord: true,
                  width: 128,
                  range: {
                      row: 7,
                      col: 2,
                      referRow: 6, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftTop'
                  }

              },
              { //14 名字
                  type: 'text',
                  content: userInfo.name,
                  fontSize: 12,
                  color: '#ffffff',
                  top: 3.3,
                  left: 48.2,
                  lineHeight: 14,
                  MaxLineNumber: 1,
                  breakWord: true,
                  width: 128,
                  range: {
                      row: 7,
                      col: 3,
                      referRow: 6, //参照的行,只有行则相对于第二行的左下角
                      referAlign: 'leftTop'
                  }

              },
              { //15 留言
                  type: 'text',
                  content: '“' + techMessage + '”',
                  fontSize: 11,
                  color: '#ffffff',
                  textAlign: 'left',
                  top: 6,
                  left: 0,
                  lineHeight: 14,
                  MaxLineNumber: 2,
                  breakWord: true,
                  width: 220,
                  range: {
                      row: 7,
                      col: 4,
                      referRow: 7, //参照的行,只有行则相对于第二行的左下角
                      referCol: 2,
                      referAlign: 'leftBottom'
                  }
              },
          ]

      };
      this.setData({
          mode: 'normal',
          painting: painting

      })



  },
  getQCode(url, callback) { //可删除
      wx.getImageInfo({
          src: url,
          complete: (res) => {
              if (res.errMsg === 'getImageInfo:ok' && (res.height != -1 && res.width != -1)) {
                  callback({
                      success: true
                  })
              } else {
                  wx.request({
                      url: url,
                      success: (res) => {
                          if (res.errMsg == "request:ok" && res.data == "") {
                              callback({
                                  success: false,
                                  data: null
                              })
                          } else {
                              callback({
                                  success: false,
                                  data: res.data
                              })
                          }

                      },
                      fail: (res) => {
                          callback({
                              success: false,
                              res: res.data
                          })
                      },
                      complete: (res) => {}
                  })

              }
          }
      })
  },
  scroll: function (event) {
      // //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
      // this.setData({
      //     scrollTop: event.detail.scrollTop
      // });
  },
  previewImage: function (e) {
      wx.getSetting({
          success: (res) => { //这个实时
              console.log(res)
              let authsetting = res.authSetting;
              if (authsetting && authsetting['scope.writePhotosAlbum']) {
                  this.saveImageToPhotosAlbum();
              } else {
                  this.setAuthImageToPhotosAlbum();
              }
          }
      });


  },
  saveImageToPhotosAlbum() {
      wx.saveImageToPhotosAlbum({
          filePath: this.data.shareImage,
          success: (res) => {
              this.setData({
                  isHiddenImg: true
              })
              wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 1000
              })
          },
          fail: (err) => {
              if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                  // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
                  this.setAuthImageToPhotosAlbum()
              }
          }
      })
  },
  onOpenSetting(e) {
      //e.detail:{opentype:"openSetting",authSetting:{scope.userInfo:true ,scope.writePhotosAlbum:false}}
      console.log(e)
  },
  onOpenSettingCancel(){
    
  },
  setAuthImageToPhotosAlbum() {
      // let dialogComponent = this.selectComponent('.opensetting-dialog')
      // dialogComponent && dialogComponent.show();
      wx.showModal({
          title: '提示',
          content: '“”需要您授权保存相册',
          showCancel: false,
          confirmColor: '#F03B34',
          success: modalSuccess => {
              wx.openSetting({
                  success(settingdata) {

                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          wx.showModal({
                              title: '提示',
                              content: '获取权限成功,再次点击图片即可保存',
                              showCancel: false,
                              confirmColor: '#F03B34',
                          })
                      } else {
                          wx.showModal({
                              title: '提示',
                              content: '获取权限失败，将无法保存到相册哦~',
                              showCancel: false,
                              confirmColor: '#F03B34',
                          })
                      }
                  },
                  fail(failData) {
                      console.log("failData", failData)
                  },
                  complete(finishData) {
                      console.log("finishData", finishData)
                  }
              })
          }
      })
  },

  cancelImage: function (e) {
      this.setData({
          isHiddenImg: true
      })
  },
  



})