function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)

    if (theta < 90) {
        theta = (theta + 270) % 360
    } else {
        theta = theta - 90;
    }
    return theta;
}

function commonPlayerEnenmy(speed, image) {
    return {
        speed: speed,
        rotation: 0,
        anchor: { x: 0.5, y: 0.5 },
        image: imageAssets[image],
        right: function () {
            if (!this.willHitSomething("right")) {
                this.x += this.speed
                this.rotation = degrees_to_radians(90)
            }
        },
        left: function () {
            if (!this.willHitSomething("left")) {
                this.x -= this.speed
                this.rotation = degrees_to_radians(270)
            }
        },
        up: function () {
            if (!this.willHitSomething("up")) {
                this.y -= this.speed
                this.rotation = degrees_to_radians(0)
            }
        },
        down: function () {
            if (!this.willHitSomething("down")) {
                this.y += this.speed
                this.rotation = degrees_to_radians(180)
            }
        },

        willHitSomething: function (direction) {
            let r = false
            switch (direction) {
                case 'up':
                    r = tileEngine.layerCollidesWith('lvl1', { x: this.x - PLAYER_SIZE / 2, y: this.y - this.speed - PLAYER_SIZE / 2, height: this.height, width: this.width })
                    break;
                case 'down':
                    r = tileEngine.layerCollidesWith('lvl1', { x: this.x - PLAYER_SIZE / 2, y: this.y + this.speed - PLAYER_SIZE / 2, height: this.height, width: this.width })
                    break;
                case 'left':
                    r = tileEngine.layerCollidesWith('lvl1', { x: this.x - this.speed - PLAYER_SIZE / 2, y: this.y - PLAYER_SIZE / 2, height: this.height, width: this.width })
                    break;
                case 'right':
                    r = tileEngine.layerCollidesWith('lvl1', { x: this.x + this.speed - PLAYER_SIZE / 2, y: this.y - PLAYER_SIZE / 2, height: this.height, width: this.width })
                    break;
            }

            // Check enemy collisions
            // TODO


            return r

        }
    }
}

function getConeView(enemy) {
    return Sprite({
        x: enemy.x,
        y: enemy.y,
        color: 'rgba(0,0,255,0.0)',
        direction: radians_to_degrees(enemy.rotation),
        points: [],

        vec: function (from, to) {
            return [to.x - from.x, to.y - from.y];
        },

        dot: function (u, v) {
            return u[0] * v[0] + u[1] * v[1];
        },
        collidesWith: function (p) {
            if (this.points.length == 3) {
                let p0 = this.points[0]
                let p1 = this.points[1]
                let p2 = this.points[2]

                var v0 = this.vec(p0, p2);
                var v1 = this.vec(p0, p1);
                var v2 = this.vec(p0, p);
                // Compute dot products

                var dot00 = this.dot(v0, v0);
                var dot01 = this.dot(v0, v1);
                var dot02 = this.dot(v0, v2);
                var dot11 = this.dot(v1, v1);
                var dot12 = this.dot(v1, v2);
                // Compute barycentric coordinates
                var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
                var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
                var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
                // Check if point is in triangle
                return (u >= 0) && (v >= 0) && (u + v < 1);

            } else {
                return false;
            }
        },
        render() {
            this.context.strokeStyle = this.color;
            this.context.beginPath();
            // draw a triangle
            this.context.moveTo(this.x, this.y);
            if (this.direction == 0) {
                this.points = [
                    { x: this.x - ENEMY_VISION_RANGE / 2.5, y: this.y - ENEMY_VISION_RANGE },
                    { x: this.x + ENEMY_VISION_RANGE / 2.5, y: this.y - ENEMY_VISION_RANGE }]
            } else if (this.direction == 90) {

                this.points = [
                    { x: this.x + ENEMY_VISION_RANGE, y: this.y + ENEMY_VISION_RANGE / 2.5 },
                    { x: this.x + ENEMY_VISION_RANGE, y: this.y - ENEMY_VISION_RANGE / 2.5 }]

            } else if (this.direction == 180) {
                this.points = [
                    { x: this.x + ENEMY_VISION_RANGE / 2.5, y: this.y + ENEMY_VISION_RANGE },
                    { x: this.x - ENEMY_VISION_RANGE / 2.5, y: this.y + ENEMY_VISION_RANGE }]

            } else if (this.direction == 270) {

                this.points = [
                    { x: this.x - ENEMY_VISION_RANGE, y: this.y - ENEMY_VISION_RANGE / 2.5 },
                    { x: this.x - ENEMY_VISION_RANGE, y: this.y + ENEMY_VISION_RANGE / 2.5 }]

            }

            this.points.push({ x: this.x, y: this.y })
            this.points.forEach(point => {
                this.context.lineTo(point.x, point.y);
            });

            this.context.closePath();
            this.context.fillStyle = this.color;
            this.context.fill()
            this.context.stroke();

        }
    })
}