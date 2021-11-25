'use strict';
const btnCloseModal = document.querySelector('.close-modal');
const btnOpenModal = document.querySelector('.add');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.popup');

btnOpenModal.addEventListener('click', function(){
    modal.classList.remove('hidden')
    overlay.classList.remove('hidden')
});

btnCloseModal.addEventListener('click', function(){
    modal.classList.add('hidden')
    overlay.classList.add('hidden')
})
overlay.addEventListener('click', function(){
    modal.classList.add('hidden')
    overlay.classList.add('hidden')
})
