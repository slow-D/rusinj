$(document).ready(function() {

    // $('.hero__head .bold').text('Hello, World!');
    // 
    $('.header-nav__item').hover(function() {
    	$(this).find('.header-nav-inside').slideToggle(200);
    });

    $('.menu-btn').on('click', function() {
    	$('.menu-btn').toggleClass('is-close');
    	$('.menu').toggleClass('is-show');
    	$('.header-nav').toggleClass('hidden');
    	$('html').toggleClass('scroll-locked');
    });


    $('.header__search .icon').on('click', function() {
    	$('.form-search').removeClass('hidden') ;
    });


    $('.header__link').on('click', function(e) {
    	e.preventDefault();
    	$('.global-overlay').removeClass('hidden');
    	$('.modal').removeClass('hidden');
    });


    $('.global-overlay').on('click', function(e) {
    	e.preventDefault();
    	$('.global-overlay').addClass('hidden');
    	$('.modal').addClass('hidden');
    });



    $('.modal__close').on('click', function(e) {
    	$('.global-overlay').addClass('hidden');
    	$('.modal').addClass('hidden');
    });


    $('.btn-up').click(function() {
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return false;
	});



	$(".down-arrow").click(function(){
		$(this).toggleClass('rotate');
		$(this).parent().next().slideToggle();
		$('.down-arrow').not(this).removeClass('rotate').parent().next().slideUp();
	});


	$('.panel-heading').click(function () {
		$(this).toggleClass('in').next().slideToggle();
		$('.panel-heading').not(this).removeClass('in').next().slideUp();
    });



	$('.products-nav_wrap .aside-nav__item').click(function(e) {
		e.preventDefault();

		var id = $(this).attr('data-prod-tab'),
		   content = $('.products-slide[data-prod-tab="'+ id +'"]'),
		   textPrev = $('.products-nav_wrap .aside-nav__item[data-prod-tab="'+ (id - 1) +'"]').find('span').text(),
		   textNext = $('.products-nav_wrap .aside-nav__item[data-prod-tab="'+ (+id + 1) +'"]').find('span').text();

		if ((id - 1) <= 0) {
			textPrev = $('.products-nav_wrap .aside-nav__item').last().find('span').text();
		} else if (+id >= +$('.products-nav_wrap .aside-nav__item').last().attr('data-prod-tab')) {
			textNext = $('.products-nav_wrap .aside-nav__item:first').find('span').text();
		}

		$('.products-pagination_prev span').text(textPrev);
		$('.products-pagination_next span').text(textNext);


		$('.products-nav_wrap .aside-nav__item.active').removeClass('active');
		$(this).addClass('active');

		$('.products-slide.active').removeClass('active');
		// $('.products-slide.active').slideToggle();
		content.addClass('active');
		// content.slideToggle();
	});


	$('.products-pagination_next').click(function(e) {

		var id = +$('.products-slide.active').attr('data-prod-tab');
		id += 1;
		var content = $('.products-slide[data-prod-tab="'+ id +'"]'),
			textPrev = $('.products-nav_wrap .aside-nav__item[data-prod-tab="'+ (id - 1) +'"]').find('span').text(),
			textNext = $('.products-nav_wrap .aside-nav__item[data-prod-tab="'+ (+id + 1) +'"]').find('span').text();

		if (+id >= +$('.products-nav_wrap .aside-nav__item').last().attr('data-prod-tab')) {
			textNext = $('.products-nav_wrap .aside-nav__item:eq(1)').find('span').text();
			textPrev = $('.products-nav_wrap .aside-nav__item').last().find('span').text();
			id = +$('.products-nav_wrap .aside-nav__item:first').attr('data-prod-tab');
		}

		$('.products-pagination_prev span').text(textPrev);
		$('.products-pagination_next span').text(textNext);


		$('.products-nav_wrap .aside-nav__item.active').removeClass('active');
		$('.products-nav_wrap .aside-nav__item[data-prod-tab="' + id + '"]').addClass('active');

		$('.products-slide.active').removeClass('active');
		$('.products-slide[data-prod-tab="'+ id +'"]').addClass('active');

	});


	$('.products-pagination_prev').click(function(e) {

		var id = +$('.products-slide.active').attr('data-prod-tab');
		id -= 1;
		var content = $('.products-slide[data-prod-tab="'+ id +'"]'),
			textPrev = $('.products-nav_wrap .aside-nav__item[data-prod-tab="'+ (id - 1) +'"]').find('span').text(),
			textNext = $('.products-nav_wrap .aside-nav__item[data-prod-tab="'+ (+id + 1) +'"]').find('span').text();

		if (+id <= 1) {
			textNext = $('.products-nav_wrap .aside-nav__item:first').find('span').text();
			textPrev = $('.products-nav_wrap .aside-nav__item:eq(-2)').find('span').text();
			id = +$('.products-nav_wrap .aside-nav__item').last().attr('data-prod-tab');
		}

		$('.products-pagination_prev span').text(textPrev);
		$('.products-pagination_next span').text(textNext);


		$('.products-nav_wrap .aside-nav__item.active').removeClass('active');
		$('.products-nav_wrap .aside-nav__item[data-prod-tab="' + id + '"]').addClass('active');

		$('.products-slide.active').removeClass('active');
		$('.products-slide[data-prod-tab="'+ id +'"]').addClass('active');

	});







	$('.services-nav_wrap .aside-nav__item').click(function(e) {
		e.preventDefault();
	   var id = $(this).attr('data-proj-tab'),
	       content = $('.services-slide[data-proj-tab="'+ id +'"]'),
		   textPrev = $('.services-nav_wrap .aside-nav__item[data-proj-tab="'+ (id - 1) +'"]').find('span').text(),
		   textNext = $('.services-nav_wrap .aside-nav__item[data-proj-tab="'+ (+id + 1) +'"]').find('span').text();
	   
		if ((id - 1) <= 0) {
			textPrev = $('.services-nav_wrap .aside-nav__item').last().find('span').text();
		} else if (+id >= +$('.services-nav_wrap .aside-nav__item').last().attr('data-proj-tab')) {
			textNext = $('.services-nav_wrap .aside-nav__item:first').find('span').text();
		}

		$('.services-pagination_prev span').text(textPrev);
		$('.services-pagination_next span').text(textNext);

	   $('.services-nav_wrap .aside-nav__item.active').removeClass('active'); // 1
	   $(this).addClass('active'); // 2
	   
	   $('.services-slide.active').removeClass('active'); // 3
	   content.addClass('active'); // 4
	});



	$('.services-pagination_next').click(function(e) {

		var id = +$('.services-slide.active').attr('data-proj-tab');
		id += 1;
		var content = $('.services-slide[data-proj-tab="'+ id +'"]'),
			textPrev = $('.services-nav_wrap .aside-nav__item[data-proj-tab="'+ (id - 1) +'"]').find('span').text(),
			textNext = $('.services-nav_wrap .aside-nav__item[data-proj-tab="'+ (+id + 1) +'"]').find('span').text();

		if (+id >= +$('.services-nav_wrap .aside-nav__item').last().attr('data-proj-tab')) {
			textNext = $('.services-nav_wrap .aside-nav__item:eq(1)').find('span').text();
			textPrev = $('.services-nav_wrap .aside-nav__item').last().find('span').text();
			id = +$('.services-nav_wrap .aside-nav__item:first').attr('data-proj-tab');
		}

		$('.services-pagination_prev span').text(textPrev);
		$('.services-pagination_next span').text(textNext);


		$('.services-nav_wrap .aside-nav__item.active').removeClass('active');
		$('.services-nav_wrap .aside-nav__item[data-proj-tab="' + id + '"]').addClass('active');

		$('.services-slide.active').removeClass('active');
		$('.services-slide[data-proj-tab="'+ id +'"]').addClass('active');

	});


	$('.services-pagination_prev').click(function(e) {

		var id = +$('.services-slide.active').attr('data-proj-tab');
		id -= 1;
		var content = $('.services-slide[data-proj-tab="'+ id +'"]'),
			textPrev = $('.services-nav_wrap .aside-nav__item[data-proj-tab="'+ (id - 1) +'"]').find('span').text(),
			textNext = $('.services-nav_wrap .aside-nav__item[data-proj-tab="'+ (+id + 1) +'"]').find('span').text();

		if (+id <= 1) {
			textNext = $('.services-nav_wrap .aside-nav__item:first').find('span').text();
			textPrev = $('.services-nav_wrap .aside-nav__item:eq(-2)').find('span').text();
			id = +$('.services-nav_wrap .aside-nav__item').last().attr('data-proj-tab');
		}

		$('.services-pagination_prev span').text(textPrev);
		$('.services-pagination_next span').text(textNext);


		$('.services-nav_wrap .aside-nav__item.active').removeClass('active');
		$('.services-nav_wrap .aside-nav__item[data-proj-tab="' + id + '"]').addClass('active');

		$('.services-slide.active').removeClass('active');
		$('.services-slide[data-proj-tab="'+ id +'"]').addClass('active');

	});




	var owlHero = $('.hero-slider');
	owlHero.owlCarousel({
		items: 1,
		loop: true,
		dots: false,
		navText: ['<div class="hero-nav_prev slider-nav_item slider-nav_prev"><svg class="icon icon-sample prev"><use xlink:href="/assets/build/sprites/global.svg#icon-arrow" /></svg></div>', '<div class="hero-nav_next slider-nav_item slider-nav_next"><svg class="icon icon-sample"><use xlink:href="/assets/build/sprites/global.svg#icon-arrow" /></svg></div>'],
		navContainer: '.hero-nav_wrap',
		onInitialized: function(e){
		    $('.hero-nav__num').text('01/' + pad(this.items().length, 2))
		}
	});

	owlHero.on('changed.owl.carousel', function(e) {
		$('.hero-nav__num').text(pad((e.item.index - 1), 2)  + '/' + pad(e.item.count, 2))
	});



	var owlProjects = $('.projects-slider');
	owlProjects.owlCarousel({
		items: 1,
		loop: true,
		dots: false,
		navText: ['<div class="projects-nav_prev slider-nav_item slider-nav_prev"><svg class="icon icon-sample prev"><use xlink:href="/assets/build/sprites/global.svg#icon-arrow" /></svg></div>', '<div class="projects-nav_next slider-nav_item slider-nav_next"><svg class="icon icon-sample"><use xlink:href="/assets/build/sprites/global.svg#icon-arrow" /></svg></div>'],
		navContainer: '.projects-nav_wrap',
		onInitialized: function(e){
		    $('.projects-nav__num').text('01/' + pad(this.items().length, 2))
		}
	});

	owlProjects.on('changed.owl.carousel', function(e) {
		$('.projects-nav__num').text(pad((e.item.index - 1), 2)  + '/' + pad(e.item.count, 2))
	});


	function pad (str, max) {
	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;
	}
});


$(window).on('load resize', function() {
	var owlItems = $('.products-slide_items');
  if ($(window).width() < 640) {
    owlItems.addClass('owl-carousel');
	owlItems.owlCarousel({
		items: 2,
		dots: false,
		margin: 15
	});
  } else {
    owlItems.trigger('destroy.owl.carousel');
  }
});