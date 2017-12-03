angular.module('Gobang', ['ng', 'ngRoute', 'ngAnimate']).config(
    function ($routeProvider) {
        $routeProvider
            .when('/start', {templateUrl: 'tpl/start.html'})
            .when('/game', {templateUrl: 'tpl/game.html', controller: 'gameCtrl'})
            .when('/userSpace', {templateUrl: 'tpl/userSpace.html', controller: 'usCtrl'})
            .otherwise({redirectTo: '/start'})
    }
).controller('parentCtrl', function ($scope, $http, $rootScope) {
    $scope.user = {};
    $scope.userLogin = {};
    $rootScope.myOff = 1;
    var loginTime=localStorage.getItem('loginTime');
    if(loginTime){
        if(+new Date()-loginTime>7*24*3600*1000){
            localStorage.removeItem('uid');
            localStorage.removeItem('uname');
            localStorage.removeItem('loginTime');
        }else{
            $scope.uid=localStorage.getItem('uid');
            $scope.userLogin.uname=localStorage.getItem('uname');
        }
    }
    $scope.setOff = function (off) {
        $rootScope.myOff = off;
        $rootScope.records = undefined;
    }
    $scope.logout = function () {
        $scope.uid = 0;
        $scope.userLogin = {};
				localStorage.removeItem('uid');
				localStorage.removeItem('uname');
				localStorage.removeItem('loginTime');
    }
    $scope.checkUser = function () {
        if ($scope.userLogin.uname && $scope.userLogin.upwd) {
            $http
							.get('data/user_check.php?' + jQuery.param($scope.userLogin))
							.success(function (data) {
                if (data[0]) {
                    $scope.uid = data[0].uid;
                    $('#login').modal('hide');
                    if($scope.userLogin.noLogin7){
                        localStorage.setItem('uid',$scope.uid);
                        localStorage.setItem('uname',$scope.userLogin.uname);
                        localStorage.setItem('loginTime',+new Date());
                    }
                } else {
                    $scope.errMessage = '用户名或密码错误！';
                }
            });
        } else {
            $scope.errMessage = '用户名或密码不能为空！';
        }
    }
    $scope.$watch('user.name', function () {
        if ($scope.user.name) {
            $http.get('data/user_register_check.php?name=' + $scope.user.name).success(function (data) {
                $scope.canUse = data === 'bucunzai' ? true : false;
            });
        }
    });
    $scope.submitUser = function () {
        if ($scope.user.name && $scope.user.pwd && $scope.user.gender && $scope.user.phone && $scope.user.email && $scope.canUse) {
            var str = jQuery.param($scope.user);
            $http.get('data/user_register.php?' + str).success(function (data) {
                $scope.id = data['id'];
            }).error(function (data) {
                $scope.errMsg = data['msg'] + data['reason'];
            });
        } else {
            $scope.errMsg = '信息填写有误，请检查后提交！';
        }
    }
}).controller('gameCtrl', function ($scope, $rootScope, $http, $location) {
    $scope.Gobang = {
        CHESS: null,//棋盘
        CTX: null,//画笔
        BSIZE: 0,//棋盘大小
        CSIZE: 0,//棋子大小
        OFFSET: 0,//棋盘边缘间隔
        WINS: [],//所有赢法的数组
        COUNT: 0,//赢法的编号
        cpuWin: [],//电脑的赢法统计数组
        chessBoard: [],//当前棋盘记录
        myWin: [], //我的赢法统计数组
        myTurn: true,//我的回合
        myOff: $rootScope.myOff,//先手

        init: function () {//初始化
            this.CHESS = document.getElementById('chess');
            this.CTX = this.CHESS.getContext('2d');
            this.BSIZE = Math.min(window.innerHeight - 40, window.innerWidth - 40, 500);
            this.CSIZE = this.BSIZE / 15;
            this.OFFSET = this.CSIZE / 2;
            this.CHESS.width = this.BSIZE;
            this.CHESS.height = this.BSIZE;
            this.myTurn = true;
            $scope.gameOver = false;
            //初始化所有赢法数组
            for (var i = 0; i < 15; i++) {
                this.WINS[i] = [];
                for (var j = 0; j < 15; j++) {
                    this.WINS[i][j] = [];
                }
            }
            for (var i = 0; i < 15; i++) {//横向
                for (var j = 0; j < 11; j++) {
                    for (var k = 0; k < 5; k++) {
                        this.WINS[i][j + k][this.COUNT] = true;
                    }
                    this.COUNT++;
                }
            }
            for (var i = 0; i < 11; i++) {//纵向
                for (var j = 0; j < 15; j++) {
                    for (var k = 0; k < 5; k++) {
                        this.WINS[i + k][j][this.COUNT] = true;
                    }
                    this.COUNT++;
                }
            }
            for (var i = 0; i < 11; i++) {//正斜向
                for (var j = 0; j < 11; j++) {
                    for (var k = 0; k < 5; k++) {
                        this.WINS[i + k][j + k][this.COUNT] = true;
                    }
                    this.COUNT++;
                }
            }
            for (var i = 0; i < 11; i++) {//反斜向
                for (var j = 14; j > 3; j--) {
                    for (var k = 0; k < 5; k++) {
                        this.WINS[i + k][j - k][this.COUNT] = true;
                    }
                    this.COUNT++;
                }
            }
            for (var i = 0; i < this.COUNT; i++) {
                this.myWin[i] = 0;
                this.cpuWin[i] = 0;
            }
            for (var i = 0; i < 15; i++) {
                this.chessBoard[i] = [];
                for (var j = 0; j < 15; j++) {
                    this.chessBoard[i][j] = [];
                }
            }
            if ($rootScope.records === undefined) {
                $scope.step = 0;
                $rootScope.records = [];
                this.drawChessBoard();
                if (!$rootScope.myOff) {
                    this.drawPiece(7, 7, true);
                    this.chessBoard[7][7][0] = -1;
                    $rootScope.records.push('7,7');
                }
            } else {
                this.loadRecords();
            }
        },
        drawChessBoard: function () { //画棋盘
            this.CTX.fillStyle = '#E4B05D';
            this.CTX.fillRect(0, 0, this.BSIZE, this.BSIZE);
            this.CTX.beginPath();
            for (var i = 0; i <= 15; i++) {
                this.CTX.moveTo(this.OFFSET, this.OFFSET + i * this.CSIZE);
                this.CTX.lineTo(this.BSIZE - this.OFFSET, this.OFFSET + i * this.CSIZE);
                this.CTX.stroke();
                this.CTX.moveTo(this.OFFSET + i * this.CSIZE, this.OFFSET);
                this.CTX.lineTo(this.OFFSET + i * this.CSIZE, this.BSIZE - this.OFFSET);
                this.CTX.stroke();
            }
            this.CTX.beginPath();
            this.CTX.fillStyle = "#333";
            this.CTX.arc(this.BSIZE / 2, this.BSIZE / 2, 4, 0, 2 * Math.PI);
            this.CTX.closePath();
            this.CTX.fill();
        },
        start: function () {
            this.init();
            var me = this;
            $scope.oneStep = function (event) {
                if ($scope.gameOver)return;
                if (!me.myTurn)return;
                var i = Math.floor(event.offsetX / me.CSIZE);
                var j = Math.floor(event.offsetY / me.CSIZE);
                if (!me.chessBoard[i][j].length) {
                    me.drawPiece(i, j, me.myOff);
                    $scope.step++;
                    me.chessBoard[i][j][$scope.step] = 1;
                    $rootScope.records.push(i + ',' + j);
                    for (var k = 0; k < me.COUNT; k++) {
                        if (me.WINS[i][j][k]) {
                            me.myWin[k]++;//我在第k种赢法上多了一颗子
                            me.cpuWin[k] = -1;//电脑不可能达成第k种赢法
                            if (me.myWin[k] == 5) {
                                $scope.gameOver = true;
                                window.alert('你赢了');
                            }
                        }
                    }
                    if (!$scope.gameOver) {
                        me.myTurn = !me.myTurn;
                        me.cpuTurn();
                    }
                }
            }
            $scope.undoOne = function () {//悔棋一步
                if ($scope.step == 0)return;
                for (var i = 0; i < 15; i++) {
                    for (var j = 0; j < 15; j++) {
                        if (me.chessBoard[i][j][$scope.step]) {
                            me.chessBoard[i][j] = [];
                        }
                    }
                }
                $scope.step--;
                $rootScope.records.pop();
                $rootScope.records.pop();
                me.update();
            }
            $scope.giveUp = function () {
                $scope.gameOver = true;
                this.disabled = true;
                window.alert('你认输了');
            }
        },
        drawPiece: function (i, j, isBlack) {//画棋子
            this.CTX.beginPath();
            this.CTX.arc(this.OFFSET + i * this.CSIZE, this.OFFSET + j * this.CSIZE, this.OFFSET - 2, 0, 2 * Math.PI);
            this.CTX.closePath();
            var gradient = this.CTX.createRadialGradient(this.OFFSET + i * this.CSIZE + 2, this.OFFSET + j * this.CSIZE - 2, this.OFFSET - 2, this.OFFSET + i * this.CSIZE + 2, this.OFFSET + j * this.CSIZE - 2, 0);
            if (isBlack) {
                gradient.addColorStop(0, "#0a0a0a");
                gradient.addColorStop(1, "#636766");
            }
            else {
                gradient.addColorStop(0, "#d1d1d1");
                gradient.addColorStop(1, "#f9f9f9");
            }
            this.CTX.fillStyle = gradient;
            this.CTX.fill();
        },
        update: function () {//更新
            this.drawChessBoard();
            $scope.gameOver = false;
            this.myTurn = true;
            for (var i = 0; i < this.COUNT; i++) {
                this.myWin[i] = 0;
                this.cpuWin[i] = 0;
            }
            for (var i = 0; i < 15; i++) {
                for (var j = 0; j < 15; j++) {
                    for (var s in this.chessBoard[i][j]) {
                        if (this.chessBoard[i][j][s] == 1) {
                            this.drawPiece(i, j, this.myOff);
                            for (var k = 0; k < this.COUNT; k++) {
                                if (this.WINS[i][j][k]) {
                                    this.myWin[k]++;
                                    this.cpuWin[k] = -1;
                                }
                            }
                        } else if (this.chessBoard[i][j][s] == -1) {
                            this.drawPiece(i, j, !this.myOff);
                            for (var k = 0; k < this.COUNT; k++) {
                                if (this.WINS[i][j][k]) {
                                    this.cpuWin[k]++;
                                    this.myWin[k] = -1;
                                }
                            }
                        }
                    }
                }
            }
        },
        cpuTurn: function () {
            var myValue = [];//我方棋子优先值
            var cpuValue = [];//电脑棋子优先值
            var maxValue = 0;//最大优先值
            var x = 0, y = 0;//电脑最终落子位置
            for (var i = 0; i < 15; i++) {
                myValue[i] = [];
                cpuValue[i] = [];
                for (var j = 0; j < 15; j++) {
                    myValue[i][j] = 0;
                    cpuValue[i][j] = 0;
                }
            }
            for (var i = 0; i < 15; i++) {
                for (var j = 0; j < 15; j++) {
                    if (!this.chessBoard[i][j].length) {
                        for (var k = 0; k < this.COUNT; k++) {
                            if (this.WINS[i][j][k]) {//在第k种赢法中
                                this.myWin[k] == 1 ? (myValue[i][j] += 100) :
                                    this.myWin[k] == 2 ? (myValue[i][j] += 400) :
                                        this.myWin[k] == 3 ? (myValue[i][j] += 1600) :
                                        this.myWin[k] == 4 && (myValue[i][j] += 20000);
                                this.cpuWin[k] == 1 ? (cpuValue[i][j] += 100) :
                                    this.cpuWin[k] == 2 ? (cpuValue[i][j] += 400) :
                                        this.cpuWin[k] == 3 ? (cpuValue[i][j] += 1600) :
                                        this.cpuWin[k] == 4 && (cpuValue[i][j] += 100000);
                            }
                            if (myValue[i][j] > maxValue) {
                                maxValue = myValue[i][j];
                                x = i;
                                y = j;
                            } else if (myValue[i][j] == maxValue) {
                                if (cpuValue[i][j] > cpuValue[x][y]) {
                                    x = i;
                                    y = j;
                                }
                            }
                            if (cpuValue[i][j] > maxValue) {
                                maxValue = cpuValue[i][j];
                                x = i;
                                y = j;
                            } else if (cpuValue[i][j] == maxValue) {
                                if (myValue[i][j] > myValue[x][y]) {
                                    x = i;
                                    y = j;
                                }
                            }
                        }
                    }
                }
            }
            this.drawPiece(x, y, !this.myOff);
            this.chessBoard[x][y][$scope.step] = -1;
            $rootScope.records.push(x + ',' + y);
            for (var k = 0; k < this.COUNT; k++) {
                if (this.WINS[x][y][k]) {
                    this.cpuWin[k]++;//电脑在第k种赢法上多了一颗子
                    this.myWin[k] = -1;//我不可能达成第k种赢法
                    if (this.cpuWin[k] == 5) {
                        $scope.gameOver = true;
                        window.alert('电脑赢了');
                    }
                }
            }
            if (!$scope.gameOver) {
                this.myTurn = !this.myTurn;
            }
            for (var i = 0; i < 15; i++) {
                for (var j = 0; j < 15; j++) {
                    if (!this.chessBoard[i][j].length) return;
                }
            }
            $scope.gameOver = true;
            window.alert('平局');
        },
        loadRecords: function () {
            if (!$rootScope.myOff) {
                this.chessBoard[7][7][0] = -1;
            }
            for (var i = 0, step = 1, rec = $rootScope.records, len = rec.length; i < len; i += 2, step++) {
                if (!$rootScope.myOff && !i) {
                    step--;
                    continue;
                }
                var p = rec[i].split(',');
                this.chessBoard[p[0]][p[1]][step] = $rootScope.myOff ? 1 : -1;
            }
            for (var i = 1, step = 1, rec = $rootScope.records, len = rec.length; i < len; i += 2, step++) {
                var p = rec[i].split(',');
                this.chessBoard[p[0]][p[1]][step] = $rootScope.myOff ? -1 : 1;
            }
            $scope.step = step - 1;
            this.update();
        }
    };
    $scope.restartGame = function () {
        if(confirm('重新开始？')){
            $rootScope.records = undefined;
            $scope.Gobang.start();
        }
    }
    $scope.gameOver = $scope.Gobang.gameOver;
    $scope.goUserSpace = function () {
        if (!$scope.uid) {
            alert('您还未登录，请先登录！');
            $('#login').modal();
            return;
        } else {
            $location.path('/userSpace');
        }
    }
    $scope.saveGame = function () {
        if (!$scope.records.length) {
            alert('当前棋盘为空...');
            return;
        }
        if (!$scope.uid) {
            alert('您还未登录，请先登录！');
            $('#login').modal();
            return;
        } else {
            $http.get('data/records_save.php?uid=' + $scope.uid + '&off=' + $rootScope.myOff
                    + '&records=' + $rootScope.records.join('-'))
                .success(function (data) {
                    if (data['msg'] === 'succ') {
                        alert('保存成功!在个人空间可查看存档记录');
                    }
                });
        }
    }
    $(function () {
        $scope.Gobang.start();
    });
}).controller('usCtrl', function ($scope, $http, $rootScope, $location) {
    if (!$scope.uid) {
        alert('您还未登录，请先登录！');
        $location.path('/start');
        return;
    }
    $http.get('data/records_loadByUser.php?uid=' + $scope.uid).success(function (data) {
        $scope.recordList = data;
        for (var i = 0, len = data.length; i < len; i++) {
            data[i].records = data[i].records.split('-');
            data[i].off = parseInt(data[i].off);
        }
    })
    $scope.loadRecord = function (rid) {
        if ($scope.records) {
            if (!confirm('确认读取存档？(将覆盖原来的游戏进度)')) {
                return;
            }
        }
        $http.get('data/records_loadById.php?rid=' + rid).success(function (data) {
            $rootScope.records = data[0].records.split('-');
            $rootScope.myOff = parseInt(data[0].off);
            $location.path('/game');
        });
    }
    $scope.deleteRecord = function (rid, index) {
        if (confirm('确认删除此存档？(删除后不可恢复)')) {
            $http.get('data/records_deleteById.php?rid=' + rid).success(function () {
                $scope.recordList.splice(index, 1);
            });
        }
    }
})


