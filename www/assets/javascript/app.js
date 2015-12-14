(function() {
  angular.module('app', ['onsen'])
  .factory('currentlyUserModel', function(){
    return {
      user: {
        id: 0,
        screen_name: "ななし",
        email: "nanashi@example.com",
        user_id: 0,
        created_at: "2015-12-13T06:55:11.893Z",
        updated_at: "2015-12-13T06:55:11.893Z"
      }
    }
  })
  .factory('infraredModel', function(){
     return {
      group: {
        name: "名無し"
      },
      infrareds: []
      }
  })
  .factory('infraredGroupModel', function(){
    return {
      groups: [{
        id: "all",
        name: "すべての赤外線"
      }]
    }
  })
  .controller('MenuController', function($scope, $timeout){
    site_url= localStorage.getItem('switch-site_url')
    this.logout = function(){
      ons.notification.confirm({
        message: 'ログアウトしますか？',
        modifier: 'material',
        callback: function(answer) {
          switch(answer){
            case 0:
              break;
            case 1:
              auth_token=localStorage.getItem('switch-auth_token')
              $.ajax({
                url: site_url + "/api/v1/auth/logout.json",
                type: "DELETE",
                data: {
                  "auth_token": auth_token,
                },
                success: function(msg){
                  localStorage.setItem("switch-auth_token","")
                  app.navi.resetToPage("./login/index.html", {animation: 'fade'})
                },
                error: function(error){
                  console.log(error)
                  if(error.status == 404){
                    localStorage.setItem("switch-site_url","")
                    app.navi.resetToPage("./404/index.html", {animation: 'lift'})
                  }else{
                    html = "<ul>";
                    messages = error.responseJSON.meta.errors.forEach(function(err){
                      html += "<li class='error'>" + err.message + "</li>";
                    });
                    html += "</ul>"
                    ons.notification.alert({
                      messageHTML: html
                    });
                  }
                }
              });
              break;
          }
        }
      });
    }
  })
  .controller('LandingController', function($scope, $timeout) {
    if(localStorage.getItem('switch-site_url')){
      if(!localStorage.getItem('switch-auth_token')){
          app.navi.resetToPage("./login/index.html", {animation: 'slide'})
      }else{
        site_url= localStorage.getItem('switch-site_url')
        auth_token=localStorage.getItem('switch-auth_token')
        $.ajax({
          url: site_url + "/api/v1/user/info.json",
          type: "GET",
          data: {
            "auth_token": auth_token,
          },
          success: function(msg){
            app.navi.pushPage("./home/index.html", {animation: 'slide'})
          },
          error: function(msg){
            if(msg.status == 404){
              localStorage.setItem("switch-site_url","")
              app.navi.pushPage("./404/index.html", {animation: 'lift'})
            }else{
              app.navi.pushPage("./signup/index.html", {animation: 'slide'})
            }
          }
        });
      }
    }else{
      app.navi.pushPage("./404/index.html", {animation: 'lift'})
    }
  })
  .controller('SignupController', function($scope, $timeout) {
    this.createUser = function() {
      if($("#password").val() != $("#password_confirm").val()){
        ons.notification.alert({
          message: 'パスワードが確認用と一致しません'
        });
      }else{
        screen_name = $("#screen_name").val();
        email = $("#email").val();
        password = $("#password").val();
        $.ajax({
          url: "" + localStorage.getItem("switch-site_url") + "/api/v1/auth/signup.json",
          type: "POST",
          data: {
            "screen_name": screen_name,
            "email": email,
            "password": password,
            "auth_token": localStorage.getItem("switch-auth_token")
          },
          success: function(msg){
            app.navi.pushPage("./home/index.html", {animation: 'slide'})
          },
          error: function(error){
            if(error.status == 404){
              localStorage.setItem("switch-site_url","")
              app.navi.resetToPage("./404/index.html", {animation: 'lift'})
            }else{
              html = "<ul>";
              messages = error.responseJSON.meta.errors.forEach(function(err){
                html += "<li class='error'>" + err.message + "</li>";
              });
              html += "</ul>"
              ons.notification.alert({
                messageHTML: html
              });
            }
          }
        });
      }
    }
  })
  .controller('LoginController', function($scope, $timeout) {
    this.user = function() {
      email_or_screen_name = $("#email_or_screen_name").val();
      password = $("#password").val();
      $.ajax({
        url: "" + localStorage.getItem("switch-site_url") + "/api/v1/auth/login.json",
        type: "POST",
        data: {
          "email_or_screen_name": email_or_screen_name,
          "password": password
        },
        success: function(msg){
          localStorage.setItem("switch-auth_token", msg["response"]["auth_token"] )
          app.navi.pushPage("./home/index.html", {animation: 'slide'})
        },
        error: function(error){
          if(error.status == 404){
            localStorage.setItem("switch-site_url","")
            app.navi.resetToPage("./404/index.html", {animation: 'lift'})
          }else{
            console.log(error)
            html = "<ul>";
            messages = error.responseJSON.meta.errors.forEach(function(err){
              html += "<li class='error'>" + err.message + "</li>";
            });
            html += "</ul>"
            ons.notification.alert({
              messageHTML: html
            });
          }
        }
      });

    }
  })
  .controller('ErrorUrlController', function($scope, $timeout) {
    this.newSiteUrl = function() {
      site_url = $("#url").val()
      console.log(site_url)
      $.ajax({
        url: "" + site_url + "/api/v1/auth/token.json",
        type:"GET",
        success: function(msg){
          localStorage.setItem("switch-site_url", "" + site_url)
          localStorage.setItem("switch-auth_token",msg["response"]["auth_token"]);
          app.navi.resetToPage("./signup/index.html", { animation: "slide" });
        },
        error: function(error){
          if(error.status == 404 || error.status == 0){
            localStorage.setItem("switch-site_url","")
            ons.notification.alert({
              message: 'URLが間違っています！',
              modifier: "material"
            });
          }else{
            text = "<ul>";
            messages = error.responseJSON.meta.errors.forEach(function(err){
              text += "<li class='error'>" + err.message + "</li>";
            });
            text += "</ul>"
            ons.notification.alert({
              messageHTML: text
            });
          }
        }
      });
    }.bind(this);

  })
  .controller('InfraredController', function($scope, $timeout, infraredModel){
    $scope.infraredModel = infraredModel;
    infraredModel.infrareds = "";
    $timeout(function(){
      var options = app.navi.getCurrentPage().options;
      infraredModel.group = options.group
      if(options.group.id == "all"){
        $.ajax({
          url: "" + site_url + "/api/v1/ir.json",
          type:"GET",
          data: {
            "auth_token": localStorage.getItem('switch-auth_token')
          },
          success: function(msg){
            console.log(msg)
            $timeout(function() {
              infraredModel.infrareds = msg["response"]["infrareds"]
            })
          },
          error: function(error){
            if(error.status == 404 || error.status == 0){
              localStorage.setItem("switch-site_url","")
              app.navi.resetToPage("./404/index.html", {animation: 'lift'})
            }else{
              text = "<ul>";
              messages = error.responseJSON.meta.errors.forEach(function(err){
                text += "<li class='error'>" + err.message + "</li>";
              });
              text += "</ul>"
              ons.notification.alert({
                messageHTML: text
              });
            }
          }
        });
      }else{
        id = parseInt(options.group.id)
        $.ajax({
          url: "" + site_url + "/api/v1/group/ir.json",
          type:"GET",
          data: {
            "auth_token": localStorage.getItem('switch-auth_token'),
            "group_id": id
          },
          success: function(msg){
            console.log(msg)
            $timeout(function() {
              infraredModel.infrareds = msg["response"]["group"]["infrareds"]
            })
          },
          error: function(error){
            if(error.status == 404 || error.status == 0){
              localStorage.setItem("switch-site_url","")
              app.navi.resetToPage("./404/index.html", {animation: 'lift'})
            }else{
              text = "<ul>";
              messages = error.responseJSON.meta.errors.forEach(function(err){
                text += "<li class='error'>" + err.message + "</li>";
              });
              text += "</ul>"
              ons.notification.alert({
                message: text
              });
            }
          }
        });
      }
    })
    this.send = function(ir_id){
      $.ajax({
        url: "" + site_url + "/api/v1/ir/send.json",
        type:"POST",
        data: {
          "auth_token": localStorage.getItem('switch-auth_token'),
          "ir_id": ir_id
        },
        success: function(msg){
          console.log(msg)
        },
        error: function(error){
          if(error.status == 404 || error.status == 0){
            localStorage.setItem("switch-site_url","")
            app.navi.resetToPage("./404/index.html", {animation: 'lift'})
          }else{
            text = "<ul>";
            messages = error.responseJSON.meta.errors.forEach(function(err){
              text += "<li class='error'>" + err.message + "</li>";
            });
            text += "</ul>"
            ons.notification.alert({
              message: text
            });
          }
        }
      });
    }.bind(this);

    this.new = function(){
      ons.notification.confirm({
        message: '赤外線を追加します',
        modifier: 'material',
        callback: function(answer) {
          switch(answer){
            case 0:
              break;
            case 1:
              if(infraredModel.group.id == "all"){
                group_id = ""
              }else{
                group_id = infraredModel.group.id.to_i
              }
              $("#receive_progress").html("<ons-progress indeterminate></ons-progress>");
              $.ajax({
                url: "" + site_url + "/api/v1/ir/receive.json",
                type:"POST",
                data: {
                  "auth_token": localStorage.getItem('switch-auth_token'),
                  "ir_id": group_id
                },
                success: function(msg){
                  ir_id = parseInt(msg["response"]["infrared"]["id"])
                  $("#receive_progress").html("");
                  ons.notification.prompt({
                    message: "赤外線名を入力してください",
                    modifier: "material",
                    callback: function(name) {
                      $.ajax({
                        url: "" + localStorage.getItem("switch-site_url") + "/api/v1/ir/rename.json",
                        type: "PUT",
                        data: {
                          "name": name,
                          "ir_id": ir_id,
                          "auth_token": localStorage.getItem("switch-auth_token")
                        },
                        success: function(msg){
                          console.log(msg)
                          window.hoge = msg
                          $timeout(function(){
                            infraredModel.infrareds.push(msg["response"]["infrared"])
                          })
                          ons.notification.alert({
                            message: '' + name + 'を追加しました！',
                            modifier: "material"
                          });
                        },
                        error: function(error){
                          if(error.status == 404){
                            localStorage.setItem("switch-site_url","")
                            app.navi.resetToPage("./404/index.html", {animation: 'lift'})
                          }else{
                            html = "<ul>";
                            messages = error.responseJSON.meta.errors.forEach(function(err){
                              html += "<li class='error'>" + err.message + "</li>";
                            });
                            html += "</ul>"
                            ons.notification.alert({
                              messageHTML: html
                            });
                          }
                        }
                      });
                    }
                  });
                },
                error: function(error){
                  $("#receive_progress").html("");
                  if(error.status == 404 || error.status == 0){
                    localStorage.setItem("switch-site_url","")
                    app.navi.resetToPage("./404/index.html", {animation: 'lift'})
                  }else{
                    text = "<ul>";
                    messages = error.responseJSON.meta.errors.forEach(function(err){
                      text += "<li class='error'>" + err.message + "</li>";
                    });
                    text += "</ul>"
                    ons.notification.alert({
                      modifier: 'material',
                      messageHTML: text
                    });
                  }
                }
              });
              break;
          }
        }
      })
    }.bind(this);
  })
  .controller('InfraredGroupController', function($scope, $timeout, infraredGroupModel) {
    $scope.infraredGroupModel = infraredGroupModel;
    $.ajax({
      url: "" + site_url + "/api/v1/group.json",
      type:"GET",
      data: {
        "auth_token": localStorage.getItem('switch-auth_token')
      },
      success: function(msg){
        window.msg = msg
        console.log(msg)
        $timeout(function() {
          infraredGroupModel.groups = [{name: "すべて", id: "all"}]
          msg["response"]["groups"].forEach(function(obj){
            infraredGroupModel.groups.push(obj)
          })
        })
      },
      error: function(error){
        if(error.status == 404 || error.status == 0){
          localStorage.setItem("switch-site_url","")
          app.navi.resetToPage("./404/index.html", {animation: 'lift'})
        }else{
          text = "<ul>";
          messages = error.responseJSON.meta.errors.forEach(function(err){
            text += "<li class='error'>" + err.message + "</li>";
          });
          text += "</ul>"
          ons.notification.alert({
            messageHTML: text
          });
        }
      }
    });
    this.newIrGroup = function() {
      ons.notification.confirm({
        message: 'グループを作成します',
        modifier: 'material',
        callback: function(answer) {
          switch(answer){
            case 0:
              break;
            case 1:
              ons.notification.prompt({
                message: "グループ名を入力してください",
                modifier: "material",
                callback: function(name) {
                  name = name
                  $.ajax({
                    url: "" + localStorage.getItem("switch-site_url") + "/api/v1/group.json",
                    type: "POST",
                    data: {
                      "name": name,
                      "auth_token": localStorage.getItem("switch-auth_token")
                    },
                    success: function(msg){
                      $timeout(function(){
                        infraredGroupModel.groups.push(msg["response"]["group"])
                      })
                      ons.notification.alert({
                        message: '' + (name||undefined) + 'を追加しました！',
                        modifier: "material"
                      });
                    },
                    error: function(error){
                      if(error.status == 404){
                        localStorage.setItem("switch-site_url","")
                        app.navi.resetToPage("./404/index.html", {animation: 'lift'})
                      }else{
                        html = "<ul>";
                        messages = error.responseJSON.meta.errors.forEach(function(err){
                          html += "<li class='error'>" + err.message + "</li>";
                        });
                        html += "</ul>"
                        ons.notification.alert({
                          messageHTML: html
                        });
                      }
                    }
                  });
                }
              });
            break;
          }
        }
      });
    }.bind(this);

    this.focusInput = function(event) {
      $timeout(function() {
        var item = event.target.parentNode.querySelector('input[type="text"]');
        item.focus();
        item.select();
      });
    }

    this.clearCompleted = function() {
      // this.groups = this.groups.filter(function(item) {
      //   return !item.done;
      // });
      infraredGroupModel.groups = infraredGroupModel.groups.filter(function(item) {
        return !item.done;
      });
    }.bind(this);

    this.selectedItem = -1;
  })
})();
