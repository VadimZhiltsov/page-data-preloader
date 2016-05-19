const mp4Regex = /video\/mp4/;
const Iconv = require('iconv').Iconv;
const charsetRegex = /charset=(\S+)$/;
const UTF8 = 'UTF-8';

export default class Parser {  

  constructor(window) {
    try {
    this.window = window;
    this.$ = window.$;
    this.encoding = this.getCharset();
    
    if (this.encoding !==  UTF8) {
      this._translator = new Iconv(this.encoding, UTF8);
    } else {
      this._translator = {
        convert(text) {
          return text || "";
        }
      }
    }

    this.data = this.parse();
    } catch(e) {
      console.error(e, e.stack);
    }
  }

  getCharset(){
    const _this = this;
    const charsetStr = this.$('meta[http-equiv]').filter(function() {
      return _this.$(this).attr('http-equiv').toLowerCase() === 'content-type';
    }).attr('content');

    const charsetFindings = charsetRegex.exec(charsetStr);

    return charsetFindings && charsetFindings.length ? charsetFindings[1] : UTF8;
  }

  parse(camera) {
    let hash = {};

    this.parseDesctiption(hash);
    this.parseTitle(hash);
    this.parseImage(hash);
    this.parseVideo(hash);
    this.parseFavicon(hash);

    return hash;
  }

  parseDesctiption(hash){
    let text = this.$('meta[name="description"]').attr('content');
    let description = this._translator.convert(text || '').toString();
    
    if(description) {
        hash.description = description;
    }
  }

  parseTitle(hash){
    let text = this.$('title').text();
    let title = this._translator.convert(text || '').toString();
    if(title) {
        hash.title = title;
    }
  }

  parseFavicon(hash){
    let icon = this.$('link[rel="icon"]').attr('href');
    
    if(!icon) {
      icon = this.$('link[rel="shortcut icon"]').attr('href');  
    }
    if(typeof icon === 'string' && icon.indexOf('//') !== 0) {
      icon = `${this.window.location.protocol}${icon}`;
    }

    if(typeof icon === 'string' && icon.indexOf('http') !== 0) {
        icon = `${this.window.location.protocol}\/\/${this.window.location.host}/${icon}`;
    }

    hash.favicon = icon;
  }

  parseImage(hash){
    let img = this.$('meta[property="og:image"]').text();
    
    if(!img) {
        img = this.$('img[rel="image_src"]').attr('src');
    }
    
    if(!img) {  
        img = this.$('link[rel="shortcut icon"]').attr('href');
    }
    
    if(!img) {  
        img = this.$('link[rel="image_src"]').attr('href');
    }
    
    if(typeof img === 'string' && img.indexOf('http') !== 0) {
        img = `${this.window.location.protocol}\/\/${this.window.location.host}/${img}`;
    }
    
    hash.img = img;
  }

  parseVideo(hash){
    let videoMeta = this.$('meta[property^="og:video"]');
    
    if(videoMeta.length) {
        let video = {}; 

        videoMeta.toArray().forEach((item) => {
            let key = this.$(item).attr('property').replace(/^og:video:/, '');
            let value = this.$(item).attr('content')
            
            video[key] = value;
        });

        hash.video = video;

        return;
    }

    let hasTwitterTag = mp4Regex.test( this.$('meta[name="twitter:player:stream:content_type"]').attr('content') );
    
    if(hasTwitterTag){
        let videoUrl =  this.$('meta[name="twitter:player:stream"]').attr('content');
        if(videoUrl){
            hash.video = {
                url: videoUrl
            };
            return;
        }
    }
  }
}
