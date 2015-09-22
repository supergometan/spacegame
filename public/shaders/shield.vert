uniform vec3 hitposition[128];
uniform float hittime[128];

uniform float radius;
uniform float time;

uniform int hits;

varying float vAlpha;

void main() {
	
	vec3 hitPos = vec3(0.0, 0.0, 9.0);
	
	float am = 0.0;
	
	for(int i = 0; i < 128; i++) {
		vec3 hit = hitposition[i];
		float dt = (time - hittime[i]);
		float d = distance(hit, position);
		float a = 1.0 - d/5.0;
		a -= (dt*dt)*3.0;
		if(a < 0.0) a == 0.0;
		if(a > am) am = a;
	}
		
	vAlpha = am;
	
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}