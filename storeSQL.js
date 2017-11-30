!function (window, undefined) {

  const utils = {

    serialize: (data) => {
      return JSON.stringify(data);
    },

    parse: (data) => {
      if (data == null) return undefined;
      return JSON.parse(data);
    },

    gettype: (value) => {
      return Object.prototype.toString.call(value)
    }

	};

  const storeSQL = function (prefix, store) {
    this.prefix = prefix;
    this.store = store;

    // start methods private
    const setPrefix = key => {
      return `${this.prefix}${key}`
    };

    const getItem = key => {
      return utils.parse(
        this.store.getItem(
          setPrefix(key),
        )
      )
    };

    const setItem = (key, data) => {
      return this.store.setItem(
        setPrefix(key),
        utils.serialize(data),
      );
    };

    const removeItem = key => {
      return this.store.removeItem(key);
    }

    const exists = key => {
      return !!getItem(key)
    };

    const deleteArray = data => {
      return data.map(indice => setPrefix(indice))
      .forEach(item => removeItem(item))
    }

    const setDataToType = (data, value, ...fn) => {
      return utils.gettype(data) == '[object Array]'
      ? fn[0](data,value)
      : utils.gettype(data) == '[object Object]'
      ? fn[1](data,value)
      : data
    }
    // end methods private

    this.create = (key, data) => {

      if (!exists(key)) {
          setItem(
            key,
            data,
          )
      }
      return this
    }

    this.insert = (key, data) => {

      let _data = getItem(key)
      const value = setDataToType(
        _data, data,
        _ => _data.concat(data),
        _ => Object.assign(_data, data)
      );

      if (exists(key)) {
          setItem(
            key,
            value,
          )
      }

    }

    this.select = (key,data = '') => {

      let result = getItem(key);

      if(data.length){

        result = setDataToType(
          result, data,
          _ => selectResult(result,data),
          _ => createObject(result,data)
        );
      }

      return result;
    }

    this.update = (key, input) => {

      let originalKey = key;

      let data = getItem(key);

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

      if (utils.gettype(key) == '[object Array]') {
          deleteArray(key)
      }

      removeItem(setPrefix(key));
    }

    this.clearAll = _ => {
      deleteArray(this.list())
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
