import json

def convert_sdf_name(text, old_name, new_name):
	'''
	Changes the name of the standard distance function
	'''
	return text.replace(old_name+'(', new_name+'(')

def db_json_shader_source_map(func, categories_to_convert, data):
	'''
	A functor instance for the database (ideally this could be read directly from schema file)
	implements a map from functions modifying glsl (string->string) to the whole json data
	'''
	filter_db_categories = lambda category : category[0] in categories_to_convert
	shader_items = filter(filter_db_categories, data.items())

	for si in shader_items:
		for item in si[1].items():
			source = item[1]
			if ('shaderSource' in source):
				source['shaderSource'] = func(source['shaderSource'])
			if ('shaderSourceHistory' in source):
				source['shaderSourceHistory'] = func(source['shaderSourceHistory'])

if __name__ == '__main__':

	# !!! These are the controls !!! (they could be put into cli arguments or a param file)
	input_db_json_file = "shader-park-export-7.json"
	output_db_json_file = "shader-park-export-7MODIFIED.json"
	sdf_old_name = 'map'
	sdf_new_name = 'surfaceDistance'
	conversion_categories = ['examples', 'forks', 'sculptures']
	rename_sdf = lambda source : convert_sdf_name(source, sdf_old_name, sdf_new_name)

	with open(input_db_json_file) as sp_json:
 		data = json.load(sp_json)
 		db_json_shader_source_map(rename_sdf, conversion_categories, data)

	with open(output_db_json_file, 'w') as json_file:
  	    json.dump(data, json_file)
 		