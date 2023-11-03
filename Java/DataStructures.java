import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.math.BigDecimal;

public class DataStructures {
    private int[][] nodesWithOffset;
    private BigDecimal[][] nodesOrderedByLatitude;
    private int[][] edges;

    public DataStructures(String filePath, boolean progressBar, boolean timer) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            for (int i = 0; i < 5; i++) {
                    reader.readLine();
                }

            int amountNodes = Integer.parseInt(reader.readLine());
            int amountEdges = Integer.parseInt(reader.readLine());

            this.nodesWithOffset = new int[amountNodes][3];
            this.nodesOrderedByLatitude = new BigDecimal[amountNodes][3];
            this.edges = new int[amountEdges][3];

            // Read the nodes and edges into the arrays.
            for (int i = 0; i < amountNodes; i++) {
                String[] line = reader.readLine().split(" ");
                this.nodesOrderedByLatitude[i] = new BigDecimal[] {new BigDecimal(line[1]), new BigDecimal(line[2]), new BigDecimal(line[3])};
                this.nodesWithOffset[i][0] = Integer.parseInt(line[0]);
            }

            for (int i = 0; i < amountEdges; i++) {
                String[] line = reader.readLine().split(" ");
                this.edges[i] = new int[] {Integer.parseInt(line[0]), Integer.parseInt(line[1]), Integer.parseInt(line[2])};
            }

            // Get the offset for each node as described in the specification to improve performance for Dijkstra's algorithm as well as the amount of edges for each node.
            for (int i = 0; i < edges.length; i++) {
                if (i == 0) {
                    this.nodesWithOffset[this.edges[i][0]][1] = 0;
                    this.nodesWithOffset[this.edges[i][0]][2] = 1;
                } else {
                    if (this.edges[i][0] != this.edges[i - 1][0]) {
                        this.nodesWithOffset[this.edges[i - 1][0]][2] = i - this.nodesWithOffset[this.edges[i - 1][0]][1];
                        this.nodesWithOffset[this.edges[i][0]][1] = i;
                        this.nodesWithOffset[this.edges[i][0]][2] = 1;
                    } else {
                        this.nodesWithOffset[this.edges[i][0]][2] += 1;
                    }
                }
            }

            sortNodeArrayByLatitude();

            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
    private void sortNodeArrayByLatitude() {
        Arrays.sort(this.nodesOrderedByLatitude, (a, b) -> a[1].compareTo(b[1]));
    }

    public BigDecimal[] findNearestLatLon(BigDecimal targetLat, BigDecimal targetLon, BigDecimal tolerance) {
        BigDecimal[] nearestCombination = null;
        BigDecimal[][] data = this.nodesOrderedByLatitude;

        // Create a BigDecimal array with all coordinates within the latitude tolerance range.
        BigDecimal[][] filteredData = Arrays.stream(data)
            .filter(row -> row[1].subtract(targetLat).abs().compareTo(tolerance) <= 0)
            .toArray(BigDecimal[][]::new);

        if (filteredData.length == 0) {
            return nearestCombination;
        }

        // Create a BigDecimal array with all coordinates within the BigDecimalitude tolerance range.
        filteredData = Arrays.stream(filteredData)
            .filter(row -> row[2].subtract(targetLon).abs().compareTo(tolerance) <= 0)
            .toArray(BigDecimal[][]::new);

        if (filteredData.length == 0) {
            return nearestCombination;
        }

        // Calculate distances to all points within the square-like area.
        BigDecimal minDistance = BigDecimal.valueOf(Double.MAX_VALUE);

        for (BigDecimal[] row : filteredData) {
            BigDecimal distance = BigDecimal.valueOf(Math.sqrt(Math.pow(row[1].subtract(targetLat).doubleValue(), 2) + Math.pow(row[2].subtract(targetLon).doubleValue(), 2)));
            if (distance.compareTo(minDistance) < 0) {
                minDistance = distance;
                nearestCombination = row;
            }
        }

        return nearestCombination;
    }

    public BigDecimal[][] getNodesOrderedByLatitude() {
        return this.nodesOrderedByLatitude;
    }

    public int[][] getNodesWithOffset() {
        return this.nodesWithOffset;
    }

    public int[][] getEdges() {
        return this.edges;
    }

    public static void main(String[] args) {
        DataStructures ds = new DataStructures("stuttgart.fmi", false, false);
        int[][] edges = ds.getEdges();
        BigDecimal[][] nodesOrderedByLatitude = ds.getNodesOrderedByLatitude();
        int[][] nodesWithOffset = ds.getNodesWithOffset();

        /*for (BigDecimal[] node : nodesOrderedByLatitude) {
            System.out.println(Arrays.toString(node));
        }*/

        BigDecimal[] node = ds.findNearestLatLon(new BigDecimal(48.832639), new BigDecimal(9.223725), new BigDecimal(0.001));
        System.out.println(Arrays.toString(node));
    }
}