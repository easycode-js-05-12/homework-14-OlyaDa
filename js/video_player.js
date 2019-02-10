class VideoPlayerBasic {
    constructor(settings) {
      this._settings = Object.assign(VideoPlayerBasic.getDefaultSettings(), settings);
      this._videoContainer = null;
      this._video = null;
      this._toggleBtn = null;
      this._progress = null;
      this._mouseDown = false;
      this._volume = null;
      this._playbackRate = null;
      this._btnBack = null;
      this._btnForward = null;
    }

    init() {
      // Проверить переданы ли  видео и контейнер
      if (!this._settings.videoUrl) return console.error("Передайте адрес видео");
      if (!this._settings.videoPlayerContainer) return console.error("Передайте селектор контейнера");
    
      // Создать разметку и добавить ее на страницу
      this._addTemplate();
      // Найти все элементы управления
      this._setElements();
      // Установить обработчики событий
      this._setEvents();
    }

    /**
     * @desc меняет контент кнопки с паузы на плэй в зависимости от состояния видео
     */
    toggle() {
      const method = this._video.paused ? 'play' : 'pause';
      this._toggleBtn.textContent = this._video.paused ? '❚ ❚' :  '►';
      this._video[method]();
    }

    /**
     * @desc определяет сколько проигралось видео в процентах
     */
    _handlerProgress() {
      const percent = (this._video.currentTime / this._video.duration) * 100;
      this._progress.style.flexBasis = `${percent}%`;
    }

    /**
     * @desc устанавливает текущее состояния продолжительности видео по х координате
     */
    _scrub(e) {
      this._video.currentTime = (e.offsetX / this._progressContainer.offsetWidth) * this._video.duration;
    }

    /**
     * @desc находит элементы управления
     */
    _setElements() {
      this._videoContainer = document.querySelector(this._settings.videoPlayerContainer);
      this._video = this._videoContainer.querySelector('video');
      this._toggleBtn = this._videoContainer.querySelector('.toggle');
      this._progress = this._videoContainer.querySelector('.progress__filled');
      this._progressContainer = this._videoContainer.querySelector('.progress');

      this._volume = document.getElementsByName('volume')[0];
      this._playbackRate = document.getElementsByName('playbackRate')[0];
      
      let arrayBtns = document.querySelectorAll('[data-skip]');
      this._btnBack = arrayBtns[0];
      this._btnForward = arrayBtns[1];
    }

    /**
     * @desc устанавливает обработчики событий
     */
    _setEvents() {
      this._video.addEventListener('click', () => this.toggle());
      this._toggleBtn.addEventListener('click', () => this.toggle());
      this._video.addEventListener('timeupdate', () => this._handlerProgress());
      this._progressContainer.addEventListener('click', (e) => this._scrub(e));
      this._progressContainer.addEventListener('mousemove', (e) => this._mouseDown && this._scrub(e));
      this._progressContainer.addEventListener('mousedown', (e) => this._mouseDown = true);
      this._progressContainer.addEventListener('mouseup', (e) => this._mouseDown = false);

      this._volume.addEventListener('click', (e) => {this._setVolume(e.target.value);});
      this._volume.addEventListener('mousemove', (e) => {this._setVolume(e.target.value);});

      this._playbackRate.addEventListener('click', (e) => {this._setPlayBackRate(e.target.value);});
      this._playbackRate.addEventListener('mousemove', (e) => {this._setPlayBackRate(e.target.value);});

      this._btnBack.addEventListener('click', (e) => {this._scrubByTime(e.target.getAttribute('data-skip'));});
      this._btnForward.addEventListener('click', (e) => {this._scrubByTime(e.target.getAttribute('data-skip'));});

      this._video.addEventListener('dblclick', (e) => {this._scrubByDblclick(e)});
    }

    /**
     * @desc на событие перематывает видео вперед this._settings.skipPrev или назад this._settings.skipNext, 
     * если двойное нажатие в левой или в правой половине экрана
     * @param {event} e - событие dblclick на объекте видеоплеер
     */
    _scrubByDblclick(e) {
      this._scrubByTime(e.offsetX < this._video.offsetWidth / 2 ? this._settings.skipPrev : this._settings.skipNext);
    }

    /**
     * @desc устанавливает уровень звука 
     * @param {number} value - число от 0.0 до 1.0
     */
    _setVolume(value) {
      this._video.volume = value;
    }

    /**
     * @desc устанавливает скорость воспроизведения
     * @param {number} value - число от 0.5 до 2.0
     */
    _setPlayBackRate(value) {
      this._video.playbackRate = value;
    }

    /**
     * @desc перематывает видео вперед или назад на sec секунд
     * @param {string} sec 
     */
    _scrubByTime(sec) {
      this._video.currentTime += parseInt(sec);
    }

    /**
     * @desc добавляет контейнер на страницу
     */
    _addTemplate() {
      const template = this._createVideoTemplate();
      const container = document.querySelector(this._settings.videoPlayerContainer);
      container ? container.insertAdjacentHTML("afterbegin", template) : console.error('контейнер не найден');
    }

    /**
     * @desc возвращает разметку страницы
     */
    _createVideoTemplate() {
      let skipPrev = this._settings.skipPrev < 0 ? -this._settings.skipPrev : this._settings.skipPrev;
      return `
      <div class="player">
        <video class="player__video viewer" src="${this._settings.videoUrl}"> </video>
        <div class="player__controls">
          <div class="progress">
          <div class="progress__filled"></div>
          </div>
          <button class="player__button toggle" title="Toggle Play">►</button>
          <input type="range" name="volume" class="player__slider" min=0 max="1" step="0.05" value="${this._settings.volume}">
          <input type="range" name="playbackRate" class="player__slider" min="0.5" max="2" step="0.1" value="1">
          <button data-skip="${this._settings.skipPrev}" class="player__button">« ${skipPrev}s</button>
          <button data-skip="${this._settings.skipNext}" class="player__button">${this._settings.skipNext}s »</button>
        </div>
      </div>
      `;
    }

    /**
     * @desc возвращает настройки по умолчанию
     */
    static getDefaultSettings() {
        /**
         * Список настроек
         * - адрес видео
         * - тип плеера "basic", "pro"
         * - controls - true, false
         */
        return {
          videoUrl: '',
          videoPlayerContainer: '.myplayer', 
          volume: 1
        }
    }
}

const myPlayer = new VideoPlayerBasic({
  videoUrl: 'video/mov_bbb.mp4',
  videoPlayerContainer: 'body',
  skipNext: 4,
  skipPrev: -4
});

myPlayer.init();