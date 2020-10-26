Promise.resolve(1).then((res) => {
   console.log(res)
}, (err) => {
    console.log(err)
});

Promise.reject(2).then((res) => {

}, (err) => {
    console.log(err)
})