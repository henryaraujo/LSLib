## Creating lib for handling the localStorage and sessionStorage APIs
### How to use
```javascript
const store = new storeSQL('prefix_here',/*localStorage or sessionStorage*/);
```
### Create new key(table)
```javascript
let books = [{
    id:1,
    title: "Christine",
    author: "Stephen King",
    year: "1983",
    pages: 503,
    rating:5
  }];
  
store.create('books',books);
```

### Insert new data
```javascript
store.insert('books',{
    id:2,
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    year: "1955",
    pages: 434,
    rating: 5
  });
 ```
  
### Select data
```javascript
store.select('books'); // get all data
store.select('books',['title','author','year']); // get fields 
```
### Remove data
```javascript
store.remove('books');// remove for key
store.remove(['books','authors']); // remove using array
```

### List key(table)
```javascript
store.list();
```

### Clear all 
```javascript
store.clearAll();
```
