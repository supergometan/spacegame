varying float vAlpha;
void main() {
	gl_FragColor = vec4(0.3 * vAlpha, 0.6 * vAlpha, 1.0, vAlpha);
	//gl_FragColor = vec4(0.75, 1.0, 1.0, 0.5);
}