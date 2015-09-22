varying vec2 vUv;
uniform sampler2D tex;
uniform float ti;
void main() {
	vec2 uv2 = vUv;
	float offsetx = mod(ti, 3.0)/3.0;
	float offsety = floor(ti/3.0)/2.0;
	
	if(ti == 5.0) {
		uv2.x = uv2.y;
		uv2.y = 1.0 - vUv.x;
	}
	
	if(ti == 3.0) {
		uv2.x = 1.0 - uv2.y;
		uv2.y = vUv.x;
	}
	
	if(ti == 2.0) {
		uv2.x = 1.0 - uv2.x;
		uv2.y = 1.0 - vUv.y;
	}
	
	if(ti == 0.0) {
		uv2.x = 1.0 - vUv.x;
		uv2.y = 1.0 - vUv.y;
	}
	
	vec2 uv = vec2(offsetx + uv2.x/3.0, offsety + uv2.y/2.0);
	
	gl_FragColor = texture2D(tex, uv);
}