const Visualizer = (function () {
  let analyzer = null;
  let dataArray = null;
  let chart = null;
  let currentRafId = null;
  let audioContext = null;
  let source = null;

  const colors = ['#FC5404', '#CF0000', '#2FC4B2', '#FE346E', '#9FE6A0', '#D62AD0', '#AA2EE6', '#EEEEEE', '#FDB827',
  ];

  const audioSrc = document.querySelector('#source-audio');

  function randomizeColors() {
    let index = Math.round(Math.random() * (5 - 0) + 0);
    if (index == colors.length) index = colors.length -1;
    chart.update({plotOptions: {column: {color: colors[index]}}});
  }

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
          color: '#A4EBF3'
        },
        series: {
          // boostBlending: 'white',
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

    // tab away, in
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        _stopVisualization();
      } else if (document.visibilityState === 'visible') {
        _drawVisualization();
      }
    });

    // initialize the analyzer
    audioSrc.addEventListener('play', function (event) {
      // color changer
      setInterval(randomizeColors, 10000);
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
