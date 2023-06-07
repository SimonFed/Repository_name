class Rec{
    constructor(a, b){
        this.a=a;
        this.b=b;
    }
    square(){
        return this.a * this.b                 
    }
}

class tr{
    constructor(a, b, c){
        this.a = a;
        this.b = b;
        this.c = c;
    }

    p() {
        return this.a+this.b+this.c
    }
}

let rect = new Rec(2,4);
let ew = new tr(2,4,6)

console.log(ew.p());