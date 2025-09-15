from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def farmer_list(request):
    return Response({"message": "List of farmers will come here"})
