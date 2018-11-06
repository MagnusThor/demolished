    float fSphere(vec3 p, float r) {
    	return length(p) - r;
    }

    // Plane with normal n (n is normalized) at some distance from the origin
    float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
    	return dot(p, n) + distanceFromOrigin;
    }

    // Cheap Box: distance to corners is overestimated
    float fBoxCheap(vec3 p, vec3 b) { //cheap box
    	return vmax(abs(p) - b);
    }

    // Box: correct distance to corners
    float fBox(vec3 p, vec3 b) {
    	vec3 d = abs(p) - b;
    	return length(max(d, vec3(0.))) + vmax(min(d, vec3(0.)));
    }

    // Same as above, but in two dimensions (an endless box)
    float fBox2Cheap(vec2 p, vec2 b) {
    	return vmax(abs(p)-b);
    }

    float fBox2(vec2 p, vec2 b) {
    	vec2 d = abs(p) - b;
    	return length(max(d, vec2(0.))) + vmax(min(d, vec2(0.)));
    }


    // Endless "corner"
    float fCorner (vec2 p) {
    	return length(max(p, vec2(0.))) + vmax(min(p, vec2(0.)));
    }

    // Blobby ball object. You've probably seen it somewhere. This is not a correct distance bound, beware.
    float fBlob(vec3 p) {
    	p = abs(p);
    	if (p.x < max(p.y, p.z)) p = p.yzx;
    	if (p.x < max(p.y, p.z)) p = p.yzx;
    	float b = max(max(max(
    		dot(p, normalize(vec3(1., 1., 1.))),
    		dot(p.xz, normalize(vec2(PHI+1., 1.)))),
    		dot(p.yx, normalize(vec2(1., PHI)))),
    		dot(p.xz, normalize(vec2(1., PHI))));
    	float l = length(p);
    	return l - 1.5 - 0.2 * (1.5 / 2.)* cos(min(sqrt(1.01 - b / l)*(PI / 0.25), PI));
    }

    // Cylinder standing upright on the xz plane
    float fCylinder(vec3 p, float r, float height) {
    	float d = length(p.xz) - r;
    	d = max(d, abs(p.y) - height);
    	return d;
    }

    // Capsule: A Cylinder with round caps on both sides
    float fCapsule(vec3 p, float r, float c) {
    	return mix(length(p.xz) - r, length(vec3(p.x, abs(p.y) - c, p.z)) - r, step(c, abs(p.y)));
    }

    // Distance to line segment between <a> and <b>, used for fCapsule() version 2below
    float fLineSegment(vec3 p, vec3 a, vec3 b) {
    	vec3 ab = b - a;
    	float t = saturate(dot(p - a, ab) / dot(ab, ab));
    	return length((ab*t + a) - p);
    }

    // Capsule version 2: between two end points <a> and <b> with radius r 
    float fCapsule(vec3 p, vec3 a, vec3 b, float r) {
    	return fLineSegment(p, a, b) - r;
    }

    // Torus in the XZ-plane
    float fTorus(vec3 p, float smallRadius, float largeRadius) {
    	return length(vec2(length(p.xz) - largeRadius, p.y)) - smallRadius;
    }

    // A circle line. Can also be used to make a torus by subtracting the smaller radius of the torus.
    float fCircle(vec3 p, float r) {
    	float l = length(p.xz) - r;
    	return length(vec2(p.y, l));
    }

    // A circular disc with no thickness (i.e. a cylinder with no height).
    // Subtract some value to make a flat disc with rounded edge.
    float fDisc(vec3 p, float r) {
    	float l = length(p.xz) - r;
    	return l < 0. ? abs(p.y) : length(vec2(p.y, l));
    }

    // Hexagonal prism, circumcircle variant
    float fHexagonCircumcircle(vec3 p, vec2 h) {
    	vec3 q = abs(p);
    	return max(q.y - h.y, max(q.x*sqrt(3.)*0.5 + q.z*0.5, q.z) - h.x);
    	//this is mathematically equivalent to this line, but less efficient:
    	//return max(q.y - h.y, max(dot(vec2(cos(PI/3), sin(PI/3)), q.zx), q.z) - h.x);
    }

    // Hexagonal prism, incircle variant
    float fHexagonIncircle(vec3 p, vec2 h) {
    	return fHexagonCircumcircle(p, vec2(h.x*sqrt(3.)*0.5, h.y));
    }

    // Cone with correct distances to tip and base circle. Y is up, 0 is in the middle of the base.
    float fCone(vec3 p, float radius, float height) {
    	vec2 q = vec2(length(p.xz), p.y);
    	vec2 tip = q - vec2(0., height);
    	vec2 mantleDir = normalize(vec2(height, radius));
    	float mantle = dot(tip, mantleDir);
    	float d = max(mantle, -q.y);
    	float projected = dot(tip, vec2(mantleDir.y, -mantleDir.x));
        
    	// distance to tip
    	if ((q.y > height) && (projected < 0.)) {
    		d = max(d, length(tip));
    	}
        
    	// distance to base ring
    	if ((q.x > radius) && (projected > length(vec2(height, radius)))) {
    		d = max(d, length(q - vec2(radius, 0.)));
    	}
    	return d;
    }

