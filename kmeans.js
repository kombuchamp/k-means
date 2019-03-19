/* K-means analysis class
 * Author: kombuchamp@gmail.com
 */
class kMeans {
    /**
     * @constructor
     * @param {Array} data - Data to analyse.
     * Array of points which are represented as arrays of coordinates (of any dimension)
     * @param {Number} k - Number of clusters (3 by default)
     */
    constructor(data, k) {
        if (!data) {
            throw Error('Provide data to init k-means analysis');
        }
        this._data = data;
        this._centroids = [];
        this._dataExtremes = this._calculateDataExtremes();
        this._dataRanges = this._calculateDataRanges();
        this._initCentroids(k);
    }

    get dataRanges() {
        return this._dataRanges || this._calculateDataRanges();
    }

    get dataExtremes() {
        return this._dataExtremes || this._calculateDataExtremes();
    }

    /**
     * Does one iteration of analysis - moves cluster centroids to the center
     * of the cluster.
     * @returns {boolean} True if centroids had moved compared to their last position
     * and false if analisys is finished
     */
    moveCentroids() {
        const dataToCentroidsMap = this._assignDataToCentroids();

        const ClusterMassCenters = Array(this._centroids.length);
        var ClusterPointCount = Array(this._centroids.length);
        var moved = false;

        for (let i in this._centroids) {
            ClusterPointCount[i] = 0;
            ClusterMassCenters[i] = Array(this._centroids[i].length);
            for (let dimension in this._centroids[i]) {
                ClusterMassCenters[i][dimension] = 0;
            }
        }

        for (let pointIndex in dataToCentroidsMap) {
            const centroidIndex = dataToCentroidsMap[pointIndex];
            const centroid = this._centroids[centroidIndex];
            const point = this._data[pointIndex];

            ClusterPointCount[centroidIndex]++;

            for (let dimension in centroid) {
                ClusterMassCenters[centroidIndex][dimension] += point[dimension];
            }
        }

        for (let centroidIndex in ClusterMassCenters) {
            if (ClusterPointCount[centroidIndex] === 0) {
                ClusterMassCenters[centroidIndex] = this._centroids[centroidIndex];

                const dataExtremes = this._dataExtremes;
                const dataRange = this._dataRanges;
                for (let dimension in dataExtremes) {
                    ClusterMassCenters[centroidIndex][dimension] =
                        dataExtremes[dimension].min + Math.random() * dataRange[dimension];
                }
                continue;
            }

            for (let dimension in ClusterMassCenters[centroidIndex]) {
                ClusterMassCenters[centroidIndex][dimension] /= ClusterPointCount[centroidIndex];
            }
        }

        if (this._centroids.toString() !== ClusterMassCenters.toString()) {
            moved = true;
        }

        this._centroids = ClusterMassCenters;

        return moved;
    }

    /**
     * Get clusters
     * @returns {Array} Array of objects representing clusters 
     * (containing cluster center and array of points in cluster)
     */
    getClusters() {
        const dataToCentroidsMap = this._assignDataToCentroids();
        let clusters = [];
        for (let centroid of this._centroids) {
            clusters.push({
                centroid,
                points: [],
            });
        }
        for (let pointIndex in dataToCentroidsMap) {
            const centroidIndex = dataToCentroidsMap[pointIndex];
            const centroid = this._centroids[centroidIndex];
            const point = this._data[pointIndex];

            const clusterIndex = clusters.findIndex(c => c.centroid === centroid);
            clusters[clusterIndex].points.push(point);
        }
        return clusters;
    }

    _calculateDataRanges() {
        const extremes = this._dataExtremes ? this._dataExtremes : this._calculateDataExtremes();
        let ranges = [];

        for (let dimension in extremes) {
            ranges[dimension] = extremes[dimension].max - extremes[dimension].min;
        }

        return ranges;
    }

    _calculateDataExtremes() {
        let extremes = [];

        for (let point of data) {
            for (let dimension in point) {
                if (!extremes[dimension]) {
                    extremes[dimension] = { min: 9000, max: 0 };
                }

                if (point[dimension] < extremes[dimension].min) {
                    extremes[dimension].min = point[dimension];
                }

                if (point[dimension] > extremes[dimension].max) {
                    extremes[dimension].max = point[dimension];
                }
            }
        }

        return extremes;
    }

    _initCentroids(k) {
        if (!k) {
            k = 3;
        }
        this._centroids = [];

        const extremes = this._dataExtremes;
        const ranges = this._dataRanges;

        for (let i = 0; i < k; i++) {
            let centroid = [];
            for (let dimension in extremes) {
                centroid[dimension] = extremes[dimension].min + Math.random() * ranges[dimension];
            }
            this._centroids.push(centroid);
        }
    }

    _assignDataToCentroids() {
        let dataToCentroidsMap = [];
        for (let i in this._data) {
            const point = data[i];
            let distances = [];

            for (let j in this._centroids) {
                const centroid = this._centroids[j];
                let sum = 0;

                for (let dimension in point) {
                    sum += (point[dimension] - centroid[dimension]) ** 2;
                }

                distances[j] = Math.sqrt(sum);
            }

            dataToCentroidsMap[i] = distances.indexOf(Math.min.apply(null, distances));
        }
        return dataToCentroidsMap;
    }
}
