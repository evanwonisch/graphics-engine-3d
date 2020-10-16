var canvas;
var ctx;
var width, height;
const FPS = 90;

window.onload = () => {
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")

    var main = new Main();

    setInterval(() => {
        canvas.width = width = window.innerWidth
        canvas.height = height = window.innerHeight
        ctx.fillStyle = "whitesmoke"
        ctx.fillRect(0, 0, width, height)

        main.update();

    }, 1000 / FPS);
}

class Main{
    constructor(){
        this.time = 0;
        this.projection = new Projection();
        
        var cube = [
            new Mesh3DTriangle([
                new Vector3D(0,0,0),
                new Vector3D(1,0,0),
                new Vector3D(1,1,0)
            ], "green"),
            new Mesh3DTriangle([
                new Vector3D(0,0,1),
                new Vector3D(1,0,1),
                new Vector3D(1,1,1),
            ], "red"),
            new Mesh3DTriangle([
                new Vector3D(0,0,1),
                new Vector3D(1,1,1),
                new Vector3D(0,1,1),
            ], "blue"),
            new Mesh3DTriangle([
                new Vector3D(0,0,0),
                new Vector3D(1,1,0),
                new Vector3D(0,1,0),
            ], "red"),
            new Mesh3DTriangle([
                new Vector3D(0,0,0),
                new Vector3D(0,0,1),
                new Vector3D(0,1,1),
            ], "gray"),
            new Mesh3DTriangle([
                new Vector3D(0,0,0),
                new Vector3D(0,1,0),
                new Vector3D(0,1,1),
            ], "red"),
            new Mesh3DTriangle([
                new Vector3D(1,0,0),
                new Vector3D(1,0,1),
                new Vector3D(1,1,1),
            ], "yellow"),
            new Mesh3DTriangle([
                new Vector3D(1,0,0),
                new Vector3D(1,1,0),
                new Vector3D(1,1,1),
            ], "red"),
            new Mesh3DTriangle([
                new Vector3D(0,0,0),
                new Vector3D(1,0,0),
                new Vector3D(1,0,1),
            ], "blue"),
            new Mesh3DTriangle([
                new Vector3D(0,0,0),
                new Vector3D(0,0,1),
                new Vector3D(1,0,1),
            ], "red"),
            new Mesh3DTriangle([
                new Vector3D(0,1,0),
                new Vector3D(1,1,0),
                new Vector3D(1,1,1),
            ], "gray"),
            new Mesh3DTriangle([
                new Vector3D(0,1,0),
                new Vector3D(0,1,1),
                new Vector3D(1,1,1),
            ], "red"),
        ]
        this.cube = new Mesh3D(cube)


    }
    update(){
        this.time += 0.01
        var meshes = []

        for(var i = 1; i < 3; i++) {
            meshes.push(
                this.cube
                .translate(-0.5,-0.5,-0.5)
                .rotateX(this.time*i*0.02)
                .rotateZ(0.2*this.time*i)
                .translate(i*3-4,0,0)
                .rotateY(this.time)
                .translate(0,Math.sin(i+this.time),8+ Math.cos(i+this.time))
            )
        }
        

        var meshes2d = meshes.map(mesh => this.projection.project(mesh))
        var triangles = meshes2d.reduce((acc, val) => acc.concat(val.triangles) , [])
        triangles.sort((a,b) => b.zIndex - a.zIndex)
        triangles.forEach(triangle => {
            triangle.draw();
        })
    }
}















class Vector3D{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(x, y, z){
        return new Vector3D(this.x + x, this.y + y, this. z + z)
    }
    scale(x,y,z){
        return new Vector3D(this.x * x, this.y * y, this.z * z)
    }
}

class Vector2D{
    constructor(x,y){
        this.x = x;
        this.y = y
    }
    add(x, y){
        return new Vector2D(this.x + x, this.y + y)
    }
    scale(x, y){
        return new Vector2D(this.x * x, this.y * y)
    }
}

class Mesh3DTriangle{
    constructor(vector3List, color){
        if(vector3List.length != 3){
            throw "Triangle must have 3 vertices"
        }
        this.vertices = vector3List
        this.mean = this.vertices.reduce((acc, val) => acc.add(val.x, val.y, val.z), new Vector3D(0,0,0))
        this.zIndex = this.mean.z
        this.color = color
    }
}

class Mesh2DTriangle{
    constructor(vector2List, zIndex, color){
        if(vector2List.length != 3){
            throw "Triangle must have 3 vertices"
        }
        this.vector2List = vector2List
        this.zIndex = zIndex
        this.color = color
    }
    draw(){
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.vector2List[0].x, this.vector2List[0].y)
        ctx.lineTo(this.vector2List[1].x, this.vector2List[1].y)
        ctx.lineTo(this.vector2List[2].x, this.vector2List[2].y)
        ctx.fill();
    }
}

class Mesh3D{
    constructor(mesh3DTriangles){
        this.triangles = mesh3DTriangles
    }
    
    translate(x, y, z) {
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => vector3.add(x, y, z)), triangle.color)))
    }
    scale(x, y, z){
        if(!y){
            return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => new Vector3D(vector3.x * x, vector3.y * x, vector3.z * x)), triangle.color)))
        } else {
            return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => new Vector3D(vector3.x * x, vector3.y * y, vector3.z * z)), triangle.color)))
        }
    }

    rotateX(alpha){
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => {
            var x = vector3.x;

            var z = Math.cos(alpha) * vector3.z - Math.sin(alpha) * vector3.y
            var y = Math.sin(alpha) * vector3.z + Math.cos(alpha) * vector3.y

            return new Vector3D(x,y,z)
        }), triangle.color)))
    }

    rotateY(alpha){
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => {
            var y = vector3.y;

            var z = Math.cos(alpha) * vector3.z - Math.sin(alpha) * vector3.x
            var x = Math.sin(alpha) * vector3.z + Math.cos(alpha) * vector3.x

            return new Vector3D(x,y,z)
        }), triangle.color)))
    }

    rotateZ(alpha){
        return new Mesh3D(this.triangles.map(triangle => new Mesh3DTriangle(triangle.vertices.map(vector3 => {
            var z = vector3.z;

            var x = Math.cos(alpha) * vector3.x - Math.sin(alpha) * vector3.y
            var y = Math.sin(alpha) * vector3.x + Math.cos(alpha) * vector3.y

            return new Vector3D(x,y,z)
        }), triangle.color)))
    }
}

class Mesh2D{
    constructor(mesh2Dtriangles){
        this.triangles = mesh2Dtriangles;
    }
}

class Projection{
    constructor(){

    }
    project(mesh){
        return new Mesh2D(mesh.triangles.map(triangle => new Mesh2DTriangle(triangle.vertices.map(vector3 => {
            var x = 0;
            var y = 0;

            x += vector3.x / vector3.z
            y += vector3.y / vector3.z

            if(vector3.z < 1){
                return new Vector2D(vector3.x * width/2 + width/2, vector3.y*width/2+ height/2)
            }

            x *= width/2
            y *= width/2

            x += width/2
            y += height/2

            return new Vector2D(x,y)
        }), triangle.zIndex, triangle.color)))
    }
}



