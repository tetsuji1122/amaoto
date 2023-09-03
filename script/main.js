let music = null;
let soundEffects = {};
soundEffects[0] = new Audio('audio/rain01.mp3');
soundEffects[1] = new Audio('audio/rain02.mp3');
soundEffects[2] = new Audio('audio/rain03.mp3');
soundEffects[3] = new Audio('audio/rain04.mp3');
let soundcnt = 0;
let currentPrecipitation = 0; //降水量

//雨の音をならす
function play() {
    if (music == null || music.paused) {
        music = soundEffects[soundcnt%4];
        music.play();
        playButton.classList.remove('fa-play');
        playButton.classList.add('fa-pause');
        soundcnt++;
    } else {
        music.pause();
        playButton.classList.remove('fa-pause');
        playButton.classList.add('fa-play');
    }
}

//気象情報を取得
function rain(lat,lon){
    if (!config || config.apikey == "") {
        console.log("apikeyが設定されていません");
        return;
    }
    //APIキー
    const apiKey = config.apikey;
    // 位置情報（緯度と経度）
    const latitude = lat; 
    const longitude = lon; 
    loadstart();
    //CROS対応のためscriptタグを生成して、コールバック関数で値を取得する
    const apiUrl = `https://api.yumake.jp/1.2/forecastMsm.php?lat=${latitude}&lon=${longitude}&key=${apiKey}&format=JSONP&callback=myCallbackFunction`;
    var script = document.createElement("script");
    script.src = apiUrl;
    document.head.appendChild(script);
}

//callback関数にて予報データを取得する
function myCallbackFunction(data) {
    //dataチェック
    if (!data || data == null || data.status != "success") {
        console.log("気象データが取得できませんでした");
        console.log(data);
        return;
    }
    //取得した予報時間と現在時刻をチェックして、現在時刻に近い予報を取得する
    let forecasts = data.forecast;
    // 現在の時刻を取得
    let currentDate = new Date();
    for (let i in forecasts) {
        let forecast = forecasts[i];
        //console.log(forecast);
        // 指定した日時を作成
        var targetDate = new Date(forecast.forecastDateTime);
        if (currentDate <= targetDate) {//現在時刻以降の最初の天気予報を取得
            //console.log(currentDate+":"+targetDate);
            //降水量をセットする
            currentPrecipitation = (forecast.precipitation == 999.99) ? 0 : forecast.precipitation;
            console.log(targetDate+"の降水量（予報）は"+currentPrecipitation+"ミリです");
            break;//ループ終了
        }
    }
    loadend();
}
  

//地図画面へ
function toMap() {
    window.location.href = "map.html";
}
  
//メイン画面へ
function toMain() {
    window.location.href = "index.html";
}




// YouTube動画のID（URLの最後の部分）を指定
var youtubeVideoId = '';

//Youtubeのモーダルウィンドウを上げる
function fadeinModal(youtubeid) {
    if (!youtubeid || youtubeid == "") return;
    console.log("modal-fadein:"+youtubeid);
    $(".modal").fadeIn();
    var youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.src = 'https://www.youtube.com/embed/' + youtubeid;
}

//Youtubeのモーダルウィンドウを閉じる
function fadeoutModal () {
    console.log("modal-fadeout");
    $(".modal").fadeOut();
    var youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.src = '';
  }
  

//地図データの取得用
//現在地の設定
let currentlatitude = 35.6337; // 例: 東京の緯度
let currentlongitude = 139.6917; // 例: 東京の経度
function setCurrentLatLon(lat,lon) {
    // currentlatitude = lat;
    // currentlongitude = lon;
}

var map = null;
var cameraMarker = [];//カメラのマーカーをセットする
var pin ;
var pin_video;
var pin_video_off;
var pin_video_on;

//地図の初期化
function initMap () {
    // 地図の初期化
    map = L.map('map').setView([currentlatitude, currentlongitude], 13); // 初期の中心座標とズームレベル

    // タイルレイヤーの追加（OpenStreetMapのデフォルトタイル）
    L.tileLayer('https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png', {
        attribution: 'Maptiles by MIERUNE, Data by OpenStreetMap contributors'
    }).addTo(map);

    pin = L.icon({
        iconUrl: 'img/pin.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
    pin_video = L.icon({
        iconUrl: 'img/pin_video.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
    pin_video_off = L.icon({
        iconUrl: 'img/pin_video_off.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
    pin_video_on = L.icon({
        iconUrl: 'img/pin_video_on.png', // 新しいアイコン画像のパス
        iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]
        iconAnchor: [16, 32], // アイコンのアンカー位置 [横, 縦]
    });
}

//地図にカメラのピンを差す
function putCameraData(data) {
    //console.log(data);
    cameraMarker = [];
    var cnt = 0;
    for (var item of data) {
        cameraMarker[cnt] = addMaker(item);
        cnt++;
    }
}

//マーカーの追加
function addMaker(item) {
    let marker = null;
    if (item.youtubeid && item.youtubeid != "") {
        let pin_icon = pin_video;
        //一番近いカメラのみアイコンを変える
        if (youtubeVideoId != null && youtubeVideoId == item.youtubeid) pin_icon = pin_video_on; 
        marker = L.marker([item.lat, item.lon], { icon: pin_icon }).addTo(map);
        marker.on('click',function(e) {  clickPinVideo(e); });
        marker.item = item;//ピンの情報をセットする
    } else {
        marker = L.marker([item.lat, item.lon], { icon: pin_video_off }).addTo(map);
    }
    return marker;
}

//ピンをクリックイベントで発火する関数
function clickPinVideo(e){
    let item = e.target.item;
    console.log( item.title + " 住所："+ item.addr +" ID:"+ item.youtubeid);
    fadeinModal(item.youtubeid);
}

//現在地を取得する
function setCurrentLocation(){
    if ("geolocation" in navigator) {
        // ブラウザがGeolocation APIをサポートしているか確認

        // 位置情報を取得する関数
        navigator.geolocation.getCurrentPosition(function (position) {
            // 成功時のコールバック関数

            // 緯度と経度を取得
            setCurrentLatLon(position.coords.latitude,position.coords.longitude);

            //現在地にピンを差して移動する
            console.log("緯度: " + currentlatitude + ", 経度: " + currentlongitude);
            var marker = L.marker([currentlatitude, currentlongitude], { icon: pin }).addTo(map);
            map.panTo([currentlatitude, currentlongitude]);

        // ここで取得した位置情報を利用できます
        }, function (error) {
            // エラー時のコールバック関数
            switch (error.code) {
            case error.PERMISSION_DENIED:
            console.error("位置情報の利用が許可されていません。");
            break;
            case error.POSITION_UNAVAILABLE:
            console.error("位置情報が利用できません。");
            break;
            case error.TIMEOUT:
            console.error("位置情報の取得がタイムアウトしました。");
            break;
            case error.UNKNOWN_ERROR:
            console.error("不明なエラーが発生しました。");
            break;
            }
        });
    } else {
        console.error("ブラウザがGeolocation APIをサポートしていません。");
    }
}

//カメラデータの読み込み
var cameraData = null;
if (cameraData == null) {
    loadstart();
    fetch('data/camera.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("camera data is loaded");
        cameraData = data;
        nearbyCamera();//最も近いカメラを取得
        if (map != null) putCameraData(cameraData);//カメラデータの設定
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });    
}


// 現在地からもっとも近いカメラを取得
function nearbyCamera() {
    console.log("nearbyCamera is start");
    navigator.geolocation.getCurrentPosition(function (position) {
        // 現在の緯度経度を設定
        setCurrentLatLon(position.coords.latitude,position.coords.longitude);

        // 最も近い目的地とその距離を初期化
        var nearestCamera = null;
        var nearestDistance = Number.MAX_VALUE;
    
        // 各目的地までの距離を計算し、最も近い目的地を特定
        cameraData.forEach(function (camera) {
            var distance = calculateDistance(currentlatitude, currentlongitude, camera.lat, camera.lon);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestCamera = camera;
            }
        });
    
        // 最も近い目的地の情報を表示
        if (nearestCamera) {
            console.log('最も近いライブ映像:', nearestCamera.title);
            console.log('距離:', nearestDistance.toFixed(2), 'km');
            youtubeVideoId = nearestCamera.youtubeid;
            changeNearCameraPin();//カメラのアイコンを変更
        } else {
            console.log('近くのライブ映像はありません。');
        }
        loadend();

        //降水量の取得
        if (map == null) rain(currentlatitude,currentlongitude);//ここのコーディングは検討必要

    });    
}


// 2つの緯度経度間の距離を計算する関数
function calculateDistance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515; // マイルをキロメートルに変換
    dist = dist * 1.609344; // キロメートルをメートルに変換
    return dist;
}

//一番近いカメラ
function changeNearCameraPin() {
    if (!cameraMarker || cameraMarker.length == 0) return;//カメラのマーカーがセットされていなければ終了
    cameraMarker.forEach(function (marker) {
        //console.log(marker);
        if (marker.item && marker.item.youtubeid == youtubeVideoId) {
            let item = marker.item;
            console.log(item);
            marker.remove();//削除して追加する
            marker = addMaker(item);
            return;
        }
    });

}

function loadstart() {
    console.log("loadstart");
    document.getElementById("spinner").style.display = "block";
}

function loadend() {
    console.log("loadend");
    document.getElementById("spinner").style.display = "none";
}

