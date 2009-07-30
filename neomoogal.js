/*
Script: neomoogal.js
	MooTools simple gallery

License:
	LGPL.

Version:
	0.1

Copyright:
	Copyright (c) 2009 [Carlos Bolaños](http://wocp.net).

Dependencies:
	- MooTools Core 1.2.3 (http://mootools.net)

Todo:
	- Add events (onFinish,onSlide,etc...)

Inspiration:
	- Multiple flash gals
	- Default icons Tango iconset (http://tango.freedesktop.org/)

Options:
	- resx: (integer) Width of the view area
	- resy: (integer) Height of the view area
	- gal: ($() object) div to inject gallery
	- source: ($() object) Source of a elements with info
	- seconds: (integer) Seconds between slides
	- cicle: (boolean) slideshow repeat?
	- dataPath: (string) path to icons
	- fade: (boolean) enable fading between images
	- buttons: (boolean) enable bottom toolbar

Events:
	- TODO
	
Notes:
  - Tested on ie6, ie7, ie8, ff3.5.1, safari4.0.2, o9.64
*/
var NeoMooGal = new Class({
    options: {
        resx:     384,
        resy:     384,
        gal:      null,
        source:   null,
        imgs:     [],
        process:  [],
        current:  0,
        dataPath: '',
        seconds:  10,
        cycle:    false,
        fade:     true,
        buttons:  true,
    },
    loading: null,
    loadingIndex:-1,
    playing:false,
    initialize: function(options) {
      this.options = $merge(this.options,options)
    },
    goTo: function() {
      gal.scan()
      gal.createDefault()
      gal.goToPage(0)
      gal.hideSource()
    },
    __f1:function() {
      if(this.playing) {
        this.timerImg = this.options.div.clone()
        this.timerImg.empty()
        this.options.div.adopt(this.timerImg)
        this.timerImg.setStyle('background','url('+this.options.dataPath+'timer1.gif) right bottom no-repeat')
        this.timerImg.setStyle('position','absolute')
      }
    },
    __f2: function() {
      if(this.playing)
        this.timerImg.setStyle('backgroundImage','url('+this.options.dataPath+'timer2.gif)')
    },
    __f3: function() {
      if(this.playing)
        this.timerImg.setStyle('backgroundImage','url('+this.options.dataPath+'timer3.gif)')
    },
    __f4: function() {
      if(this.playing) {
        this.timerImg.dispose()
        this.onNext({stop:function(){}})
        this.goPlay()
      }
    },
    __f5: function() {
      if(this.playing) {
        this.timerImg.dispose()
        this.goToPage(0)
        this.goPlay()
      }
    },
    goPlay:function(force) {
      if(this.loading)
        this.goPlay.bind(this).delay(500)
      else
      if(this.options.current<this.options.process.length-1) {
        if(this.playPauseButton)
          this.playPauseButton.setStyle('backgroundImage','url('+this.options.dataPath+'playback-pause.png)')
        this.playing = true;
        var quatter = this.options.seconds*1000/4
        this.__f1.bind(this).delay(quatter)
        this.__f2.bind(this).delay(quatter*2)
        this.__f3.bind(this).delay(quatter*3)
        this.__f4.bind(this).delay(quatter*4)
      } else if(this.options.cycle||force) {
        if(this.playPauseButton)
          this.playPauseButton.setStyle('backgroundImage','url('+this.options.dataPath+'playback-pause.png)')
        this.playing = true;
        var quatter = this.options.seconds*1000/4
        this.__f1.bind(this).delay(quatter)
        this.__f2.bind(this).delay(quatter*2)
        this.__f3.bind(this).delay(quatter*3)
        this.__f5.bind(this).delay(quatter*4)
      } else {
        this.playing = false
        if(this.playPauseButton)
          this.playPauseButton.setStyle('backgroundImage','url('+this.options.dataPath+'playback-start.png)')
      }
    },
    scan:function() {
      this.options.process =
      this.options.source.getElements('a').map(function(i) {
        return [i.get('href'),i.get('text')]
      })
    },
    goToPage:function(index) {
      this.options.div.empty()
      if(this.loading) {
        this.loading.dispose()
      } else {
        this.loadingImg = this.options.div.clone()
        this.options.div.adopt(this.loadingImg)
        this.loadingImg.setStyle('backgroundImage','url('+this.options.dataPath+'loading.gif)')
      }
      this.loadingIndex = index
      this.loading = new Element('img', {
        events: {
          load:this.onLoadImage.bind(this)
        }
      })
      this.loading.set('src',this.options.process[index][0])
    },
    
    hideSource: function() {
      this.options.source.setStyle('display','none')
    },
    createDefault: function() {
      var opts = this.options
      var div = opts.gal
      div.empty()
      div.setStyles({
          backgroundColor:'#222',
          width:opts.resx
      })
      
      div.adopt(
  			opts.legend = new Element('p', {
  			  text: 'loading',
  			  styles: {
  			    fontSize:'1.1em',
  			    margin:0,
  			    padding:'0.3em 0.3em 0.1em 0.3em',
  			    overflow:'hidden',
  			    height:'1.2em',
  			    backgroundColor:'#7a8a85',
  			    color:'white'
  			  }
  			})
      )
      
      div.adopt(
  			opts.div = new Element('div', {
  			  styles: {
  			    width:opts.resx,
  			    height:opts.resy,
  			    background:'url('+this.options.dataPath+'loading.gif) center no-repeat'
  			  }
  			})
      )
      
      var _this = this
      opts.aes = opts.process.map(function(el,i) {
        var str = (i+1)+''
        if(str.length<2)
          str = '0'+str
        return [new Element('a',{
          href:'#',
          text:str,
          styles:{
            color:'#ddd'
          },
          events: {
  			    click:_this.onPage.bind(_this)
  			  }
        }),new Element('text',{text:' '})]
      })
      if(opts.buttons) {
        var tds = [
  			  new Element('td').adopt( new Element('a', {
  		      href:'#',
    			  styles: {
    			    display:'block', width:16, height:16,
    			    background:'url('+this.options.dataPath+'skip-backward.png) center'
    			  },
    			  events: {
    			    click:this.onIni.bind(this)
    			  }
    			})),
          new Element('td').adopt( new Element('a', {
  		      href:'#',
    			  styles: {
    			    display:'block', width:16, height:16,
    			    background:'url('+this.options.dataPath+'seek-backward.png) center'
    			  },
    			  events: {
    			    click:this.onPrevious.bind(this)
    			  }
    			})),
    			opts.pages = new Element('td', {
  		      href:'#',
    			  styles: {
    			    width:'100%',
    			    textAlign:'center',
    			    fontSize:'0.8em'
    			  }
    			}).adopt(opts.aes.flatten()),
    			new Element('td').adopt( new Element('a', {
  		      href:'#',
    			  styles: {
    			    display:'block', width:16, height:16,
    			    background:'url('+this.options.dataPath+'seek-forward.png) center'
    			  },
    			  events: {
    			    click:this.onNext.bind(this)
    			  }
    			})),
          new Element('td').adopt( new Element('a', {
  		      href:'#',
    			  styles: {
    			    display:'block', width:16, height:16,
    			    background:'url('+this.options.dataPath+'skip-forward.png) center'
    			  },
    			  events: {
    			    click:this.onEnd.bind(this)
    			  }
    			})),
    			new Element('td').adopt( this.playPauseButton = new Element('a', {
  		      href:'#',
    			  styles: {
    			    display:'block', width:16, height:16,
    			    background:'url('+this.options.dataPath+'playback-start.png) center'
    			  },
    			  events: {
    			    click:this.onPlayPause.bind(this)
    			  }
    			}))
  			]
        var todo = 
  			  new Element('tr', {
  			    // fuck IE ;)
            // styles: { verticalAlign: 'center' }
    			}).adopt(tds)
        div.adopt(
    			new Element('table', {
    			  styles: {
    			    backgroundColor:'black',
    			    color:'white',
    			    width:'100%'
    			  }
    			}).adopt(
    			  new Element('tbody').adopt(todo)
    			)
        )
      }
    },
    
    onPage: function(event) {
      event.stop()
      var as = this.options.pages.getElements('a')
      this.goToPage(as.indexOf(event.target))
    },
    onIni:function(event) {
      event.stop()
      this.goToPage(0)
    },
    onPrevious:function(event) {
      event.stop()
      if(this.options.current>0)
        this.goToPage(this.options.current-1)
    },
    onNext:function(event) {
      event.stop()
      if(this.options.current<this.options.process.length-1)
        this.goToPage(this.options.current+1)
    },
    onEnd:function(event) {
      event.stop()
      this.goToPage(this.options.process.length-1)
    },
    onPlayPause:function(event) {
      event.stop()
      if(this.playing) {
        this.playing = false
        this.playPauseButton.setStyle('backgroundImage','url('+this.options.dataPath+'playback-start.png)')
      } else {
        this.goPlay(true)
      }
    },
    onLoadImage:function(event) {
      var opts = this.options
      var index = this.loadingIndex
      var kk = this.options.process[index][0]
      if(opts.fade) {
        this.loadingImg.setStyle('backgroundColor',opts.gal.getStyle('backgroundColor'))
        this.loadingImg.setStyle('backgroundImage',opts.div.getStyle('backgroundImage'))
      }
      opts.div.setStyle('backgroundImage','url('+kk+')')
      opts.legend.set('text',opts.process[index][1])
      if(opts.buttons) {
        var as = this.options.pages.getElements('a')
        as.each(function(el,i) {
          if(i==index)
            el.setStyle('textDecoration','none')
          else
            el.setStyle('textDecoration','underline')
        })
      }
      opts.current = index
      if(opts.fade) {
        this.loadingImg.fade(0).get('tween').chain(this.onEndFade.bind(this))
      } else {
        this.onEndFade()
      }
    },
    onEndFade:function() {
      this.loadingImg.dispose()
      this.loading = null
    }
})