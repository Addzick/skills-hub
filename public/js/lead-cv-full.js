function introFull(){var r=$(".intro-full-next"),l=$(".intro-full"),e=(l.height(),$(".intro-full-content"));e.height();$(window).width()<768?(r.css("marginTop","0px"),$("#intro-video").addClass("hidden"),e.addClass("intro-full-content-static")):(l.css("height",$(window).height()+"px"),$(window).height()/$(window).width()>.563197?($("#intro-video").addClass("hidden"),console.log("No")):($("#intro-video").removeClass("hidden"),console.log("Si")))}function navbarScroll(){var r=$(".intro-full"),l=r.height();$(window).scrollTop()>l?$(".navbar").addClass("navbar-scroll"):$(".navbar").removeClass("navbar-scroll")}window.onresize=introFull;var handler=window.onresize;handler.apply(window,[" On"]),$(document).ready(introFull),$(window).resize(introFull),$(window).scroll(navbarScroll),$(function(){var r=$("#go-intro-full-next"),l=$("#intro-next");r.click(function(){$("html, body").stop().animate({scrollTop:l.offset().top},1e3)}),$("body").scrollspy({target:"#navbar-lead",offset:200}),$('[data-spy="scroll"]').each(function(){$(this).scrollspy("refresh")}),setTimeout(function(){introFull()},200),$("#Container").mixItUp()});var myCircle1=Circles.create({id:"circles-1",radius:60,value:95,maxValue:100,width:5,text:function(r){return r+"%"},colors:["rgba(255,255,255,0.3)","#fff"],duration:1e3,wrpClass:"circles-wrp",textClass:"circles-text"}),myCircle2=Circles.create({id:"circles-2",radius:60,value:90,maxValue:100,width:5,text:function(r){return r+"%"},colors:["rgba(255,255,255,0.3)","#fff"],duration:1e3,wrpClass:"circles-wrp",textClass:"circles-text"}),myCircle3=Circles.create({id:"circles-3",radius:60,value:85,maxValue:100,width:5,text:function(r){return r+"%"},colors:["rgba(255,255,255,0.3)","#fff"],duration:1e3,wrpClass:"circles-wrp",textClass:"circles-text"});