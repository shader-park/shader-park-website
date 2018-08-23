
## Backend
- [x] Make it
- [x] Database schema ~~+ sort (Redis?)~~ MongoDB
- Permissions for users
	- ~~__could__ issue hashcodes/passwords to allow the original author to edit their own shader while keeping the shader readonly for everyone else~~
	- lock shaders while actively editing

## Frontend
- [x] basic Camera/player controls
- the Room/Park
	- Sky?
	- Texture on floor, walls. General embellishments. Faked AO.
	- grid layout?
		 - helps collisions
		 - could be infinite
		 - somehow handle large grid, dynamic loading
- Break up main.js into gamestate, generate scene, interface, and network files/classes

- Network
	- [x] show other players
	- [x] smooth interpolation between updates
- the Sculptures
	- [x] multiple shaders  
	- bounding boxes/spheres
		- need to be bigger or autocalculated
		- allow varying xz dimensions?
	- [x] depth magic
	- handle bad shaders
		- priortize faster to load shaders
		- load balencing
	- [x] player interaction (editing, creating)
	- [x] editor
		- [x] still need to be able to move camera
		- [x] HTML editor for now
			- [CodeMirror](http://codemirror.net)
		- [x] compile/save(push to database) buttons
		- ability to @export and @import glsl functions to and from a global namespace
	- [x] culling (handled automatically)
	- more provided uniforms to shader (mouse coords, closest player coords, light position)
- Usability
	- Well documented and structured default shader
	
- Social media features  :)
	- "like" objects
	- chat room?

- Permissions for users
	- lock shaders while actively editing


## Schema + Protocol

grid of Sculptures, (x,y) coordinates

### Sculptures
- key: coordinate string
- name
- shader source
- author
- active editing flag
+ create/modify
* updating a scuplture pushs a message to each client invalidating that shader
- Use clients to measure shader compile/render time. Push these to server to figure out which ones to display when

### Player
- location 
- orientation?
- id/name
- sculpture edit status
- [x] timeout?

- [x] lowish time resolution for polling server: 200ms
	- sends player state
	- poll response should be any updates from the server (other player states)
- modified shader sends out invalidation message to clients
