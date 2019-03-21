from tethys_sdk.base import TethysAppBase, url_map_maker


class GoongreenGoconnected(TethysAppBase):
    """
    Tethys app class for Go Connected.
    """

    name = 'Go Connected'
    index = 'goongreen_goconnected:home'
    icon = 'goongreen_goconnected/images/Transportation_icon.png'
    package = 'goongreen_goconnected'
    root_url = 'goongreen-goconnected'
    color = '#60ea59'
    description = 'This app calculates the connectivity of cities in Utah and Salt Lake counties.'
    tags = '&quot;connectivity&quot;, &quot;transportation&quot;'
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='goongreen-goconnected',
                controller='goongreen_goconnected.controllers.home'
            ),
            UrlMap(
                name='map',
                url='goongreen-goconnected/map',
                controller='goongreen_goconnected.controllers.map'
            ),
            UrlMap(
                name='proposal',
                url='goongreen-goconnected/proposal',
                controller='goongreen_goconnected.controllers.proposal'
            ),
            UrlMap(
                name='mockups',
                url='goongreen-goconnected/mockups',
                controller='goongreen_goconnected.controllers.mockups'
            ),

        )

        return url_maps
