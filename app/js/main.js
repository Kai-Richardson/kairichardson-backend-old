
window.onload = function() {
	Particles.init({
	  selector: '.particles-js',
	  maxParticles: 120,
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