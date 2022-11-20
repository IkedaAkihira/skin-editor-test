/*参考 
https://wass80.hateblo.jp/entry/2020/04/14/JS%E3%81%AEArray%23shift%E3%81%8C%E9%81%85%E3%81%84%E3%81%AE%E3%81%A7%E3%82%AD%E3%83%A5%E3%83%BC%E3%82%92%E9%A0%91%E5%BC%B5%E3%82%8B%EF%BC%8E%E7%B5%90%E6%9E%9Cwasm%E3%81%AF%E9%80%9F%E3%81%84%EF%BC%8E
https://cpprefjp.github.io/reference/queue/queue.html
*/
class Queue{
    #head;
    #tail;
    constructor(){
        this.#head=[];
        this.#tail=[];
    }
    #tailToHead(){
        let ret=false;
        while(this.#tail.length){
            ret=true;
            this.#head.push(this.#tail.pop());
        }
        return ret;
    }
    push(item){
        this.#tail.push(item);
    }
    pop(){
        if(this.#head.length||this.#tailToHead())
            return this.#head.pop();
        return null;
    }
    get front(){
        if(this.#head.length||this.#tailToHead())
            return this.#head[this.#head.length-1];
        return null;
    }
    get back(){
        if(this.#tail.length)
            return this.#tail[this.#tail.length-1];
        if(this.#head.length)
            return this.#head[0];
        return null;
    }
    get size(){
        return this.#head.length+this.#tail.length;
    }
}

class PriorityQueue{
    #heap;
    #compare;
    constructor(){
        this.#heap=[];
        this.#compare=(first,second)=>{
            return first>second;
        };
    }
    push(item){
        this.#heap.push(item);
        let childIndex=this.#heap.length-1;
        while(childIndex){
            //console.log(this.#heap);
            let parentIndex=Math.floor((childIndex-1)/2);
            if(this.#compare(this.#heap[parentIndex],this.#heap[childIndex]))
                break;
            let tmp=this.#heap[parentIndex];
            this.#heap[parentIndex]=this.#heap[childIndex];
            this.#heap[childIndex]=tmp;
            childIndex=parentIndex;
        }
    }
    pop(){
        if(this.#heap.length<=1)
            return this.#heap.pop();
        let parentIndex=0;
        let out=this.#heap[0];
        this.#heap[0]=this.#heap.pop();
        //console.log(this.#heap);
        while(1){
            let childIndex=2*parentIndex+1;
            if(childIndex>=this.#heap.length)
                break;
            if(!(childIndex==this.#heap.length-1))
                childIndex+=this.#compare(this.#heap[childIndex+1],this.#heap[childIndex]);
            if(this.#compare(this.#heap[parentIndex],this.#heap[childIndex]))
                break;
            let tmp=this.#heap[parentIndex];
            this.#heap[parentIndex]=this.#heap[childIndex];
            this.#heap[childIndex]=tmp;
            //console.log(parentIndex,childIndex,this.size,this.#heap);
            parentIndex=childIndex;
        }
        return out;
    }
    get top(){
        return this.#heap[0];
    }
    get size(){
        return this.#heap.length;
    }
    setCompare(compareFunction){
        this.#compare=compareFunction;
    }
}

class ListNode{
    parentList;
    nextNode;
    prevNode;
    item;
    constructor(item,parentList){
        this.parentList=parentList;
        this.item=item;
        this.nextNode=null;
        this.prevNode=null;
    }
    insertNextNode(node){
        if(this.nextNode==null)
            return;
        this.parentList._size++;
        this.nextNode.prevNode=node;
        node.nextNode=this.nextNode;
        node.prevNode=this;
        this.nextNode=node;
    }
    //一つのノードだけ切られるの闇が深い。さらに、イテレータでそれが保持されたままだと、誰ともつながりのない謎の空間に飛ばされたみたいになるの怖い。
    eraseSelf(){
        if(this.nextNode==null||this.prevNode==null)
            return;
        this.parentList._size--;
        this.nextNode.prevNode=this.prevNode;
        this.prevNode.nextNode=this.nextNode;
    }
}

class List{
    #dummyFrontNode;
    #dummyBackNode;
    _size;
    constructor(){
        this._size=0;
        this.#dummyFrontNode=new ListNode(null,this);
        this.#dummyBackNode=new ListNode(null,this);
        this.#dummyFrontNode.nextNode=this.#dummyBackNode;
        this.#dummyBackNode.prevNode=this.#dummyFrontNode;
    }
    get front(){
        return this.#dummyFrontNode.nextNode.item;
    }
    get back(){
        return this.#dummyBackNode.prevNode.item;
    }

    get size(){
        return this._size;
    }

    pushBack(item){
        this.#dummyBackNode.prevNode.insertNextNode(new ListNode(item,this));
    }
    pushFront(item){
        this.#dummyFrontNode.insertNextNode(new ListNode(item,this));
    }
    popBack(){
        this.#dummyBackNode.prevNode.eraseSelf();
    }
    popFront(){
        this.#dummyFrontNode.nextNode.eraseSelf();
    }

    iterator(){
        return new ListIterator(this.#dummyFrontNode.nextNode,this);
    }
}

class ListIterator{
    #currentNode;
    #parentList;
    constructor(node,parentList){
        this.#currentNode=node;
        this.#parentList=parentList;
    }
    get hasNext(){
        if(this.#currentNode.nextNode&&this.#currentNode.nextNode.nextNode)
            return true;
        return false;
    }

    get hasPrev(){
        if(this.#currentNode.prevNode&&this.#currentNode.prevNode.prevNode)
            return true;
        return false;
    }

    next(){
        this.#currentNode=this.#currentNode.nextNode;
        return this.#currentNode.item;
    }

    prev(){
        this.#currentNode=this.#currentNode.prevNode;
        return this.#currentNode.item;
    }

    erase(){
        //自分の子供にすべてを託して自らlistを抜けるみたいな感じ。
        const out=new ListIterator(this.#currentNode.nextNode,this.#parentList);
        this.#currentNode.eraseSelf();
        return out;
    }

    insert(item){
        const insertNode=new ListNode(item,this.#parentList);
        this.#currentNode.insertNextNode(insertNode);
        return new ListIterator(insertNode,this.#parentList);
    }

    get item(){
        return this.#currentNode.item;
    }
    set item(item){
        this.#currentNode.item=item;
    }
}