{
    "variables": {
        'gpu%': '<!(echo $DARKNET_BUILD_WITH_GPU)',
        'cudnn%': '<!(echo $DARKNET_BUILD_WITH_CUDNN)',
        'openmp%': '<!(echo $DARKNET_BUILD_WITH_OPENMP)',
    },

    "targets": [{
        "target_name": "darknet",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],

        "conditions": [
            [ 'gpu==1', {
                'defines': [
                    'GPU'
                ],
                'include_dirs': [
                    '/usr/local/cuda/include/'
                ],
                'libraries': [
                    '-L/usr/local/cuda/lib64 -lcuda -lcudart -lcublas -lcurand'
                ],
            } ],
            [ 'cudnn==1', {
                'defines': [
                    'CUDNN'
                ],
                'libraries': [
                    '-lcudnn'
                ]
            }],
            [ 'openmp==1', {
                'libraries': [
                    '-fopenmp'
                ]
            }]
        ],

        "sources": [
            "cppsrc/main.cpp",
            "cppsrc/detector.cpp"
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")",
            "darknet/include/",
        ],
        'libraries': [
            "../darknet/libdarknet.a",
        ],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 
            'NAPI_DISABLE_CPP_EXCEPTIONS',
        ]
    }]
}
