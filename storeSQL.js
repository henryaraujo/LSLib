!function (window, undefined) {

  const utils = {

  serialize: (data) => {
    return JSON.stringify(data);
  },

  unserialize: (data) => {
    if (data == null) return undefined;
    return JSON.parse(data);
  },

  gettype: (value) => {
    return Object.prototype.toString.call(value)
    }

	};
	
	const Private = (prefix,store) =>{
		const self = {
			setItem: (key,data) =>{
				return store.setItem(
					self.setPrefix(key),
					utils.serialize(data),
				);
			},

			getItem: key => {
				return store.getItem(
					self.setPrefix(key),
				)
			},

			setPrefix: (key) =>{
				return `${prefix}${key}`
			},

			exists: key => {
				return !!self.getItem(key);
			}
		}

		return self;
	};

  const storeSQL = function (prefix, store) {
    this.prefix = prefix;
		this.store = store;
		const $ = Private(prefix,store);

    this.create = (key, data) => {

      if (!$.exists(key)) {
        $.setItem(
          key,
          data,
        )
      }
      return this
    }

    this.insert = (key, data) => {

      let _data = utils.unserialize($.getItem(key))
      let value = null;

      if (utils.gettype(_data) == '[object Array]') {
        value = _data.concat(data);
      }

      if (utils.gettype(_data) == '[object Object]') {
        value = Object.assign(_data, data)
      }

      if ($.exists(key)) {
        $.setItem(
          key,
          value,
        )
      }

    }

    this.select = (key,data = '') => {

      let result = utils.unserialize($.getItem(key));

      if(data.length){

        if(utils.gettype(result) == '[object Array]'){
          result = selectResult(result,data);
        }else if(utils.gettype(result) == '[object Object]'){
          result = createObject(result,data);
        }
      }

      return result;
    }

    this.update = (key, input) => {

      let originalKey = key;

      let data = utils.unserialize($.getItem(key));

      const objectUpdate = [];

      let keysNotExists = Object.keys(input).filter(value => {
        if(!Object.keys(data).includes(value)){
          return value
        }else{
          objectUpdate.push(value)
        }
      });

      let dataUpdate = createObject(input,objectUpdate);
      this.insert(originalKey,dataUpdate);

      if(keysNotExists.length){
        console.log(`These fields don't exist: [${keysNotExists}] in ('${originalKey}')`)
      }
    }

    this.where = (key, data) => {}

    this.remove = (key) => {
      let self_key = null;

      if (utils.gettype(key) == '[object Array]') {
        key.map(indice => $.setPrefix(indice))
          .forEach(_key => this.store.removeItem(_key))
      } else {
        self_key = $.setPrefix(key);
      }

      this.store.removeItem(self_key);
    }

    this.clearAll = _ => {

      this.list()
        .map(indice => $.setPrefix(indice))
        .forEach(key => this.store.removeItem(key))

    }

    this.list = _ => {

      return Object.keys(this.store)
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.replace(this.prefix, ''));
    }
  }

    const selectResult = (result,data) => {

			return result.map(input => {
					return createObject(input,data);
			});
    }

    const createObject = (input,data) => {

      let response = {};

      data.forEach((item) =>{
        response[item] = input[item]
      });

      return response
    }

    if (typeof define === 'function' && define.amd) {
      define(function () {
        return { storeSQL: storeSQL };
      });
    } else if (typeof exports !== 'undefined') {
      module.exports = storeSQL;
    } else {
      window.storeSQL = storeSQL;
    }

}(window);