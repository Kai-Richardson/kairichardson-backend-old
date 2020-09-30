
window.onload = function() {
	let particleNum = 120;
	if (navigator.userAgent.match(/Mobile/)) {
		particleNum = 20;
	}
	Particles.init({
	  selector: '.particles-js',
	  maxParticles: particleNum,
	  connectParticles: true,
	  sizeVariations: 2,
	  minDistance: 200,
	  color: "#3aaf82" //$colorPrimary
	});
  };

// #to-top button appears after scrolling
var fixed = false;
$(document).scroll(function() {
	if ($(this).scrollTop() > 250) {
		if (!fixed) {
			fixed = true;
			$('#to-top').show("slow", function() {
				$('#to-top').css({
					position: 'fixed',
					display: 'block'
				});
			});
		}
	} else {
		if (fixed) {
			fixed = false;
			$('#to-top').hide("slow", function() {
				$('#to-top').css({
					display: 'none'
				});
			});
		}
	}
});