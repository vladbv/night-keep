
Inventory = function(socket, server) {
var self = {
	items: [],
	socket: socket,
	server: server,
}
self.addItem = function(id, amount){
for(var i= 0; i < self.items.length; i++){
if(self.items[i].id === id){
self.items[i].amount += amount;
	self.refreshRender();
	return;
}

}
self.items.push({id: id, amount: amount});
self.refreshRender();


}

self.removeItem = function(id, amount){

for(var i = 0; i < self.items.length; i++){
if(self.items[i].id === id) {
self.items[i].amount -= amount;
	if(self.items[i].amount <= 0){
self.items.splice(i, 1);
		self.refreshRender();
		return;
	}
}
}

}

self.hasItem = function(id, amount){
for(var i = 0; i < self.items.length; i++){

if(self.items[i].id === id){
return self.items[i].amount >= amount;
}

}
return false;

}

self.refreshRender = function() {
//server stuff
if(self.server) {
self.socket.emit('updateInventory', self.items);
	return;
}
var inventory = document.getElementById('inventory');
inventory.innerHTML = "";
var addButton = function(data) {
let button = document.createElement('button');

let item = Item.List[data.id];

button.onclick = function(){

self.socket.emit("useItem", item.id);


}
button.innerText = item.name  + " x"  + data.amount;
inventory.appendChild(button);

}



// the client

for(var i = 0; i < self.items.length; i++){
addButton(self.items[i]);
}

}

if(self.server) {
socket.on('useItem', function(itemId){
if(!self.hasItem(itemId, 1)){
console.log("Cheater");
	return;
}
let item = Item.list[itemId];
item.event(Player.list[self.socket.id]);

});

}

return self;
}

Item = function(id, name, event){

var self = {
	id: id,
	name: name,
	event: event,

}
Item.List[self.id] = self;
return self;

}
Item.List = {};

Item("elven bread", "Elven Bread", function(player) {
player.hp = 10;
	player.inventory.removeItem("elven bread", 1);

});

Item("potionattack", "Potion Attack", function(player){
player.hp = 10;
player.inventory.removeItem('potionattack', 1);

player.inventory.addItem('superAttack', 1);

});

Item("superAttack", "Super Attack", function(player){

for(var i = 0; i < 360; i++){

player.shootBullet(i);
}

});


Item("orc", "Orc", function() {
Enemy.randomlyGenerate();
});

