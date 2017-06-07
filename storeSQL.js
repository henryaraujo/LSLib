!function (window, undefined) {

    let utils = {

        serialize: function (data) {
            return JSON.stringify(data);
        },

        unserialize: function (data) {
            if (data == null) return undefined;
            return JSON.parse(data);
        },

        gettype: function (value) {
            return Object.prototype.toString.call(value)
        },

        isJSON: function (value) {
            let regex = new RegExp(/^[\[|\{](\s|.*|\w)*[\]|\}]$/);
            return regex.test(value)
        }
    };

    let storeSQL = function (prefix, store) {
        this.prefix = prefix;
        this.store = store;

        this.setPrefix = function (key) {
            return `${this.prefix}${key}`
        }

        this.create = function (key, data) {
            key = this.setPrefix(key)

            if (!exists(this.store, key)) {
                this.store.setItem(
                    key,
                    utils.serialize(data)
                )
            }
            return this
        }

        this.insert = function (key, data) {
            key = this.setPrefix(key)
            let _data = utils.unserialize(this.store.getItem(key))
            let _value;

            if (utils.gettype(_data) == '[object Array]') {
                _data.push(data)
                _value = _data
            }

            if (utils.gettype(_data) == '[object Object]') {
                _value = Object.assign(_data, data)
            }

            if (exists(this.store, key)) {
                this.store.setItem(
                    key,
                    utils.serialize(_value)
                )
            }

        }

        this.select = function (key,data = '') {
            key = this.setPrefix(key)
            
            let _return = utils.unserialize(this.store.getItem(key));

            if(data.length){

                if(utils.gettype(_return) == '[object Array]'){
                  _return = selectResult(_return,data);
                }else if(utils.gettype(_return) == '[object Object]'){
                  _return = createObject(_return,data);  
                }
            }

            return _return;
        }

        this.update = function (key, data){}

        this.where = function (key, data){}

        this.remove = function (key) {
            let self_key;

            if (utils.gettype(key) == '[object Array]') {
                key.map(indice => this.setPrefix(indice))
                    .forEach(_key => this.store.removeItem(_key))
            } else {
                self_key = this.setPrefix(key);
            }

            this.store.removeItem(self_key);
        }

        this.clearAll = function () {

            this.list()
                .map(indice => this.setPrefix(indice))
                .forEach(key => this.store.removeItem(key))

        }

        this.list = function () {
            
            return Object.keys(this.store)
                         .filter(key => key.startsWith(this.prefix))
                         .map(key => key.replace(this.prefix, ''));
        }
    }

    function exists(sql, key) {
        return !!sql.getItem(key)
    }
  
    function selectResult(result,data){

      return result.map(input => {
            return createObject(input,data);
       });
    }

    function createObject(input,data){

        let response = {};
    
        data.forEach((item,i) =>{
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