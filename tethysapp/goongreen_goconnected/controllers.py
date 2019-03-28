from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import Button

@login_required()
def home(request):
    """
    Controller for the app home page.
    """
    context = {}

    return render(request, 'goongreen_goconnected/home.html', context)

@login_required()
def map(request):
    """
    Controller for the app home page.
    """
    context = {}

    return render(request, 'goongreen_goconnected/map.html', context)

@login_required()
def proposal(request):
    """
    Controller for the app home page.
    """
    context = {}

    return render(request, 'goongreen_goconnected/proposal.html', context)

@login_required()
def mockups(request):
    """
    Controller for the app home page.
    """
    context = {}

    return render(request, 'goongreen_goconnected/mockups.html', context)