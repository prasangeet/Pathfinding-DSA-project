from django.db import models

class Node(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"({self.latitude}, {self.longitude})"

class Edge(models.Model):
    start_node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name="start_edges")
    end_node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name="end_edges")
    weight = models.FloatField()

    def __str__(self):
        return f"({self.start_node.latitude}, {self.start_node.longitude}) -> ({self.end_node.latitude}, {self.end_node.longitude}) ({self.weight})"
