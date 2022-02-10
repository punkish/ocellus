"use strict";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

NodeList.prototype.__proto__ = Array.prototype;
HTMLCollection.prototype.__proto__ = Array.prototype;

Node.prototype.on = function(name, fn) {
  this.addEventListener(name, fn);
  return this;
};

NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn) {
  this.forEach(elem => elem.on(name, fn));
  return this;
};