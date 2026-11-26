# Changelog

## 1.0.0 (2026-11-26)


### Features

* add 35 images to level ([b95b857](https://github.com/remarkablegames/rez-store/commit/b95b857e25afd31e781e1e5221aa9965bba2af53))
* add 3rd tier upgrade per brush ([4feec98](https://github.com/remarkablegames/rez-store/commit/4feec9857e7ff82cef7fc54812918ea52c704c78))
* add layered grime/strength, over-scrub damage, & two-axis color ([9e4dc8f](https://github.com/remarkablegames/rez-store/commit/9e4dc8fd8005427eaf4891cb0055c612f9d8a3a0))
* add photo levels and show next image when restoration is complete ([9cd5412](https://github.com/remarkablegames/rez-store/commit/9cd5412577d47a220cbf60bf57e69d47836d2f22))
* add photo restoration game with two-stage flow ([08e6f55](https://github.com/remarkablegames/rez-store/commit/08e6f553d9a715ff5463cf98a11fd49da60434ad))
* add purchasable brush upgrades in the shop ([39e2740](https://github.com/remarkablegames/rez-store/commit/39e2740defca3155e34f61d0d4ae6419797fb73d))
* add shop with wide/detail brush upgrades ([cdb391f](https://github.com/remarkablegames/rez-store/commit/cdb391f9d55339ce312fa3231ded66677f6224c7))
* add torn-shard photo reassembly puzzle before cleaning stage ([57b6ee6](https://github.com/remarkablegames/rez-store/commit/57b6ee68bdf8e79ef09d2c6568ae6316dd55b78a))
* **constants:** add brush upgrade levels 4-5 ([8b4d52b](https://github.com/remarkablegames/rez-store/commit/8b4d52bbdd9fb6094c1e48a057a68cb7d15154f7))
* improve puzzles ([1fc47ff](https://github.com/remarkablegames/rez-store/commit/1fc47ff67477a89d610bc546b14014d95cb8e153))
* **levels:** add per-level abrasion control ([3fa50ab](https://github.com/remarkablegames/rez-store/commit/3fa50abfd9252f3f269a3eb9f85b70023006c37d))
* make colors purchaseable in shop ([f670805](https://github.com/remarkablegames/rez-store/commit/f670805cd0e87ef24ac5eeaffc565e80ba89d39c))
* make turns unlimited and right-click to rotate counter-clockwise ([8e8a515](https://github.com/remarkablegames/rez-store/commit/8e8a515d1180094e933add3d8fceb917ea5dffeb))
* **music:** load tracks async in the background and play them in order ([bb24785](https://github.com/remarkablegames/rez-store/commit/bb24785cfcba2928239eb036ccd9397ca4a6fb7c))
* persist level progress and resume on continue ([3bbee2f](https://github.com/remarkablegames/rez-store/commit/3bbee2fc83ae784c9f7bd3b9444cc2e79afb5ad9))
* play shutter sound when puzzle is completed ([63709a6](https://github.com/remarkablegames/rez-store/commit/63709a66cedd02fab4065fcf4486fcb51a5a0073))
* randomize color slider solution per job ([d9b91cc](https://github.com/remarkablegames/rez-store/commit/d9b91ccea7034a566c32e52bab7f458a1af085c6))
* register 3 lofi music in playlist ([8167677](https://github.com/remarkablegames/rez-store/commit/8167677bd090e2924dcf8aafd43a52a23ac7f97a))
* remove Retry button ([5c362b0](https://github.com/remarkablegames/rez-store/commit/5c362b0cb42e3339a426fe63e06e3fcc265d3a39))
* replace "Work Lamp" shop upgrade with the "Inspect" tool ([eddfa65](https://github.com/remarkablegames/rez-store/commit/eddfa652a8e2b3942075e9e033725051c41cd54d))
* replace instant feedback with graded submission ([ca5808e](https://github.com/remarkablegames/rez-store/commit/ca5808e860b116cf5fa106bf2fc65d4b56c97ce8))
* **scenes:** add Title with continue/restart buttons ([57bb388](https://github.com/remarkablegames/rez-store/commit/57bb3880918376f670dac0a74b1df0532264b4de))
* **shop:** change inspect and color upgrades into tiered purchases ([c2ed6aa](https://github.com/remarkablegames/rez-store/commit/c2ed6aaa814971ed324a57c64e23f03cb3896789))
* **sounds:** play drop sound on color slider press ([75f17a3](https://github.com/remarkablegames/rez-store/commit/75f17a34ac8b3b12f3b288026bbd1daba2857bc3))
* **sounds:** play scratch hard/soft based on grime amount ([8ef2cb3](https://github.com/remarkablegames/rez-store/commit/8ef2cb30deb0693539283d1de8690542c7cb7d27))
* **sounds:** play scratch sounds when brushing photo ([7d78598](https://github.com/remarkablegames/rez-store/commit/7d785981f8c9c221381ae3fdb377df4d4ba25d86))
* **sounds:** play ui sounds for click, hover, select, and grade outcomes ([92c9f7d](https://github.com/remarkablegames/rez-store/commit/92c9f7d2a66045036a0738fa5d2e3a83097b3f96))
* unlock incremental mechanics ([41d619e](https://github.com/remarkablegames/rez-store/commit/41d619ebecbb915b304cc542dc89cea1d07f044a))


### Bug Fixes

* **components:** stop color slider from sticking to cursor ([0aa9ecb](https://github.com/remarkablegames/rez-store/commit/0aa9ecb2048aecdec6eaf6c6aded03eae25904cd))
* disable and hide brush during inspect ([94912cc](https://github.com/remarkablegames/rez-store/commit/94912ccea4ceb5241492cf3fcdf216a92b297400))
* don't grade color as 100% and pay fee if color is disabled ([cf2d436](https://github.com/remarkablegames/rez-store/commit/cf2d436445e5f242e872b495de76bdab48800842))
* floor surface to 100% once residual grime is below threshold ([22e1126](https://github.com/remarkablegames/rez-store/commit/22e11267e22534647613130f35395c92ec4ebb36))
* **gameobjects:** keep brush visible and cleanable over photo border ([0b5dada](https://github.com/remarkablegames/rez-store/commit/0b5dada16af2bf16d3e403f2c3345bdbb340cb08))
* keep visual scratches visible at low level abrasion ([0d7f63a](https://github.com/remarkablegames/rez-store/commit/0d7f63a59b08182583ff7ce0c54cf2852cd9c79a))
* **puzzle:** render unsolved pieces above solved pieces ([9dbb7f8](https://github.com/remarkablegames/rez-store/commit/9dbb7f832463e613cb49e225f7de3cfa406e1d63))


### Performance Improvements

* load photo image in the background ([eeaf471](https://github.com/remarkablegames/rez-store/commit/eeaf4718f6319922bd3cae2d43c83c243123111b))
* **scenes:** preload first music and photo in Title ([ef4bc7f](https://github.com/remarkablegames/rez-store/commit/ef4bc7fb6a1df0a3d48ec77b9cee4806003aee36))
