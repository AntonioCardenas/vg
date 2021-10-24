from django.shortcuts import render
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.views.generic import View, TemplateView
from django.http import JsonResponse
from json import dumps
from web3 import Web3

# Create your views here.
class MainGalleryView(TemplateView):
    template_name = "main.html"

class GetDefaultStatics(View):
    def get(self, request, *args, **kwargs):
        default_statics = {}
        default_statics["ceil_img"] = static('main/images/ceil.jpg')
        default_statics["floor_img"] = static('main/images/floor.jpg')
        default_statics["loader_img"] = static('main/images/loader.png')
        default_statics["wall_img"] = static('main/images/wall.jpg')
        default_statics["img_1"] = static('main/images/1.jpg')
        default_statics["img_2"] = static('main/images/2.jpg')
        return JsonResponse({"code": 200, "message": dumps(default_statics)})

