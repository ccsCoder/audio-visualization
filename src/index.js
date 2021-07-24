const Visualizer = (function () {
  let analyzer = null;
  let dataArray = null;
  let chart = null;
  let currentRafId = null;
  let audioContext = null;
  let source = null;

  // const colors = ''

  const audioSrc = document.querySelector('#source-audio');

  function _init() {
    // initialize the chart
    chart = Highcharts.chart('visualizer', {
      boost: {
        useGPUTranslations: true,
      },
      chart: {
        alignTicks: false,
        softThreshold: false,
        type: 'column',
        backgroundColor: 'transparent',
        showAxes: false,
        animation: false,
        panning: {
          enabled: false,
        },
      },
      title: {
        text: ''
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        visible: false,
        tickLength: 0,
        gridLineWidth: 0,
      },
      yAxis: {
        visible: false,
        tickLength: 0,
        gridLineWidth: 0,
      },
      plotOptions: {
        column: {
          color: '#ffa69e'
        },
        series: {
          boostBlending: 'black',
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        marker: {
          enabled: false,
        },
        showLegend: false,
        boostThreshold: 1,
        data: [0]
      }],
    });

    document.querySelector('#audio-control').addEventListener('click', function () {
      if (this.getAttribute('data-playing') === 'no') {
        audioSrc.play();
        this.setAttribute('data-playing', 'yes');
        this.innerText = 'Playing ...';
      }
      else if (this.getAttribute('data-playing') === 'yes') {
        audioSrc.pause();
        this.setAttribute('data-playing', 'no');
        this.innerText = 'Click to play a song'
      }
    });

    // tab away, in
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        _stopVisualization();
      } else if (document.visibilityState === 'visible') {
        _drawVisualization();
      }
    });

    audioSrc.addEventListener('canplay', function () {
      document.querySelector('#audio-control').removeAttribute('disabled');
    });

    // initialize the analyzer
    audioSrc.addEventListener('play', function (event) {
      // Surprise
      setTimeout(function() {
        chart.update({plotOptions: {column: {color: '#FFDF00'}}});
      }, 51000);
      // audioCntext and source
      audioContext = audioContext || new AudioContext();
      if (!source || !source.mediaElement) {
        source = audioContext.createMediaElementSource(audioSrc);
      }
      analyzer = analyzer || audioContext.createAnalyser();
      // connect analyser to the source
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      console.log('Audio context analyser connected to source...');

      // get data for creating our waveform...
      // frequencyBinCount returns the data points length for the visualization
      analyzer.fftSize = 1024;
      const bufferLength = analyzer.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      _drawVisualization();
    });

    // stop vis on pause / track end.
    audioSrc.addEventListener('pause', _stopVisualization);
    audioSrc.addEventListener('ended', _stopVisualization);
  }

  function _stopVisualization() {
    window.cancelAnimationFrame(currentRafId);
  }

  function _drawVisualization() {
    currentRafId = requestAnimationFrame(_drawVisualization);
    // udpate dataArray with the timedomain data.
    // Note to self: Never write sucky APIs like this which updates its argument
    analyzer.getByteTimeDomainData(dataArray);
    chart.series[0].setData(dataArray);
  }

  return {
    visualize: function () {
      _init();
    }
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  if (!window.AudioContext)
    throw new Error("Your browser does not support audio contexts");
  Visualizer.visualize();
});
