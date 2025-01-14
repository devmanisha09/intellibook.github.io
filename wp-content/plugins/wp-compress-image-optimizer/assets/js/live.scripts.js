jQuery(document).ready(function ($) {

    var uncompressed_images = 0;
    var credits = 0;
    var credit_unit = 'KB';

    $.ajaxSetup({async: true, cache: false});
    $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_get_credits_ajax', hash: Math.random().toString(36).substring(7)},
        function (response) {
            if (response.success) {
                var data = response.data.data;
                credit_unit = data.unit;

                if (data.type == 'shared') {
                    if (data.credits > 0) {
                        credits = data.credits;
                    } else {
                        credits = 0;
                        credit_unit = "KB";
                    }
                } else {
                    if (data.credits > 0) {
                        credits = data.credits;
                    } else {
                        credits = 0;
                        credit_unit = "KB";
                    }
                }
            }
        });


    function updateProcessStatus() {
        $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_process_status', hash: Math.random().toString(36).substring(7)}, function (response) {
            if (response.success) {

                if (response.data.process == 'done') {
                    $('.wps-ic-legacy-stopping-process').hide();
                    $('.wps-ic-legacy-option').removeClass('wps-ic-legacy-hide').show();
                    clearInterval(processStatusInterval);

                    $('.process-progress').hide();
                    $('.progress-bar').hide();
                    $('.wps-ic-stop-bg-process').hide();

                    if (response.data.type == 'compress') {
                        $('.process-status-message').addClass('done').html('All Your Images Are Optimized!');
                    } else {
                        $('.process-status-message').addClass('done').html('All Your Images Are Restored!');
                    }

                    return false;
                }

                if (response.data.count == 0 || response.data.total == 0) {
                    $('.wps-ic-legacy-stopping-process').hide();
                    $('.wps-ic-legacy-option').removeClass('wps-ic-legacy-hide').show();
                    clearInterval(processStatusInterval);

                    if (response.data.name == 'compress') {
                        $('.process-status-message').addClass('done').html('All Your Images Are Optimized!');
                    } else {
                        $('.process-status-message').addClass('done').html('All Your Images Are Restored!');
                    }

                    return false;
                }

                if (typeof response.data.count == 'undefined' || typeof response.data.total == 'undefined') {
                    $('.wps-ic-legacy-stopping-process').show();
                    $('.wps-ic-legacy-hide').removeClass('wps-ic-legacy-hide').hide();
                }

                if (response.data == 'stopping') {
                    $('.wps-ic-legacy-stopping-process').show();
                    $('.wps-ic-legacy-hide').removeClass('wps-ic-legacy-hide').hide();

                    if (response.data.name == 'compress') {
                        $('.process-status-message').addClass('done').html('All Your Images Are Optimized!');
                    } else {
                        $('.process-status-message').addClass('done').html('All Your Images Are Restored!');
                    }
                    return false;
                }

                if (response.data.name == 'compress') {
                    $('.process-status-message').html('Compressing ' + response.data.count + ' out of ' + response.data.total);
                } else {
                    $('.process-status-message').html('Restoring ' + response.data.count + ' out of ' + response.data.total);
                }


                if (response.data.count >= response.data.total) {
                    if (response.data.name == 'compress') {
                        $('.process-status-message').addClass('done').html('All Your Images Are Optimized!');
                    } else {
                        $('.process-status-message').addClass('done').html('All Your Images Are Restored!');
                    }

                    $('.process-progress').hide();
                    $('.progress-bar').hide();
                    $('.wps-ic-stop-bg-process').hide();
                }

                $('.process-progress').html(response.data.progress + '%');
                $('.progress-bar-inner').css('width', response.data.progress + '%');

                if (response.data == false) {
                    $('.process-status-message').hide();
                    $('.wps-ic-stop-bg-process').parent().hide();
                    clearInterval(processStatusInterval);
                }
            } else {
                if (response.data == 'not-local-compress') {
                    clearInterval(processStatusInterval);
                } else {
                    $('.wps-ic-legacy-stopping-process').hide();
                    $('.wps-ic-legacy-option').removeClass('wps-ic-legacy-hide').show();
                    clearInterval(processStatusInterval);
                }
            }
        });
    }

    var processStatusInterval = setInterval(function () {
        updateProcessStatus();
    }, 3000);


    /**
     * @since 4.50.65
     */
    $('.wps-ic-stop-bg-process').on('click', function (e) {
        Swal.fire({
            title: '',
            html: jQuery('#legacy-stop-process').html(),
            width: 650,
            padding: 0,
            customClass: {
                container: 'no-padding-popup',
            },
            showCancelButton: true,
            cancelButtonColor: '#eef1f4',
            confirmButtonColor: '#ea7a62',
            confirmButtonText: '<i class="ic-cancel"></i> Stop',
            cancelButtonText: '<i class="ic-check"></i> Resume',
            allowOutsideClick: false,
            onOpen: function () {

            }
        }).then(function (msg) {
            console.log('msg');
            console.log(msg);
            // function when confirm button clicked
            if (msg.value == 'true' || msg.value == true) {
                $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_all_stop', hash: Math.random().toString(36).substring(7)}, function (response) {
                    if (response.success) {
                        setTimeout(function () {
                            Swal.close();
                            window.location.reload();
                        }, 1000);
                    } else {
                        alert('Oops! We weren\'t able to stop the process! :(');
                    }
                });
            }

        }, function (dismiss) {
            console.log('dismiss');
            console.log(dismiss);
        });
    });

    /**
     * @since 4.50.65
     */
    $('.wps-ic-restore-all').on('click', function (e) {
        e.preventDefault();


        $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_restore_count', hash: Math.random().toString(36).substring(7)}, function (response) {
            if (response.success) {
                if (response.data.compressed_images <= 0) {
                    nothing_to_restore();
                } else {
                    Swal.fire({
                        title: '',
                        html: jQuery('#legacy-restore-all').html(),
                        width: 650,
                        padding: 0,
                        customClass: {
                            container: 'no-padding-popup ic-compress-all-popup',
                        },
                        showCancelButton: true,
                        confirmButtonText: '<i class="ic-check"></i> Yes',
                        cancelButtonText: '<i class="ic-cancel"></i> No',
                        allowOutsideClick: false,
                        onOpen: function () {

                        }
                    }).then(function (isConfirm) {
                        if (isConfirm.value == true) {

                            Swal.fire({
                                title: '',
                                html: jQuery('#legacy-restore-prepare').html(),
                                width: 650,
                                padding: 0,
                                customClass: {
                                    container: 'no-padding-popup-bottom-bg',
                                    cancelButton: 'close-white-text-bigger'
                                },
                                showConfirmButton: false,
                                showCancelButton: true,
                                cancelButtonColor: '#0091f6',
                                cancelButtonText: 'Stop',
                                allowOutsideClick: false,
                                onOpen: function () {

                                    setTimeout(function () {
                                        $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_restore_all', hash: Math.random().toString(36).substring(7)}, function (response) {
                                            if (response.success) {
                                                setTimeout(function () {
                                                    Swal.close();
                                                    window.location.reload();
                                                }, 2000);
                                            } else {
                                                alert('Oops! We weren\'t able to start the process! :(');
                                            }
                                        });
                                    }, 2000);

                                }
                            }).then(function (msg) {
                                // function when confirm button clicked
                                if (msg.dismiss == 'cancel') {
                                    $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_all_stop', hash: Math.random().toString(36).substring(7)}, function (response) {
                                        if (response.success) {
                                            setTimeout(function () {
                                                Swal.close();
                                                window.location.reload();
                                            }, 1000);
                                        } else {
                                            alert('Oops! We weren\'t able to stop the process! :(');
                                        }
                                    });
                                }

                            }, function (dismiss) {
                            });


                        } else {
                            return false;
                        }
                    });
                }
            }
        });

        return false;

        return false;
    });

    /**
     * @since 4.50.65
     */

    function wps_ic_compress_all() {

        $.ajaxSetup({async: true, cache: false});
        $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_compress_all_ping', hash: Math.random().toString(36).substring(7)}, function (response) {

            if (response.success) {
                setTimeout(function () {
                    wps_ic_compress_all();
                }, 750);

            } else {
                if (response.data == 'no-att') {

                } else {
                    setTimeout(function () {
                        wps_ic_compress_all();
                    }, 1250);
                }
            }
        });

    }


    var retry_restore = 0;
    var restore_count = 0;

    function wps_ic_restore_all() {

        $.ajaxSetup({async: true, cache: false});
        $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_restore_all_ping', hash: Math.random().toString(36).substring(7)}, function (response) {

            if (response.success) {
                setTimeout(function () {
                    wps_ic_restore_all();
                }, 750);

                restore_count++;
                $('span.current', '.wp-compress-bulk-state').html(restore_count);

            } else {
                if (response.data == 'no-att') {

                } else {
                    setTimeout(function () {
                        wps_ic_restore_all();
                    }, 2350);
                }
            }
        });

    }


    /**
     * @since 4.50.65
     */
    $('.wps-ic-compress-all').on('click', function (e) {
        e.preventDefault();

        if (credits <= 0) {
            // Does user have enough credits for all images?
            $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_count_uncompressed_images'}, function (response) {
                if (response.success) {
                    if (response.data.uncompressed > 0) {
                        if (response.data.uncompressed > credits) {
                            uncompressed_images = response.data.uncompressed;
                            unit = response.data.unit;
                            show_nocredits_dialog(credits, uncompressed_images, unit);
                        } else {
                            prepare_compress();
                        }
                    } else {
                        uncompressed_images = 0;
                        nothing_to_compress();
                    }
                } else {
                    // Error, cannot read uncompressed images?
                }
            });

            return false;
        } else {
            // Does user have enough credits for all images?
            $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_count_uncompressed_images'}, function (response) {
                if (response.success) {
                    if (response.data.uncompressed > 0) {
                        if (response.data.uncompressed > credits) {
                            uncompressed_images = response.data.uncompressed;
                            unit = response.data.unit;
                            show_nocredits_dialog(credits, uncompressed_images, unit);
                        } else {
                            show_compress_dialog();
                        }
                    } else {
                        uncompressed_images = 0;
                        nothing_to_compress();
                    }
                } else {
                    // Error, cannot read uncompressed images?
                }
            });


            return false;
        }


        return false;
    });


    function prepare_compress() {
        Swal.fire({
            title: '',
            html: jQuery('#legacy-compress-prepare').html(),
            width: 650,
            padding: 0,
            customClass: {
                container: 'no-padding-popup-bottom-bg',
                cancelButton: 'close-white-text-bigger'
            },
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColor: '#0091f6',
            cancelButtonText: 'Stop',
            allowOutsideClick: false,
            onOpen: function () {

                setTimeout(function () {
                    $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_compress_all', hash: Math.random().toString(36).substring(7)}, function (response) {
                        if (response.success) {
                            setTimeout(function () {
                                Swal.close();
                                window.location.reload();
                            }, 1000);
                        } else {
                            alert('Oops! We weren\'t able to start the process! :(');
                        }
                    });
                }, 2000);

            }
        }).then(function (msg) {
            // function when confirm button clicked
            if (msg.dismiss == 'cancel') {
                $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_all_stop', hash: Math.random().toString(36).substring(7)}, function (response) {
                    if (response.success) {
                        setTimeout(function () {
                            Swal.close();
                            window.location.reload();
                        }, 1000);
                    } else {
                        alert('Oops! We weren\'t able to stop the process! :(');
                    }
                });
            }

        }, function (dismiss) {
        });
    }


    function nothing_to_restore() {


        var html = jQuery('#legacy-nothing-to-restore').html();

        Swal.fire({
            title: '',
            html: html,
            width: 650,
            confirmButtonColor: '#fdfdfd',
            confirmButtonText: 'Go Back',
            customClass: {
                container: 'no-padding-popup-bottom-bg nothing-to-do-popup',
            },
            showCancelButton: false,
            showConfirmButton: true,
            showCloseButton: false,
            allowOutsideClick: true,
            onBeforeOpen: () => {

            },
            onOpen: function () {

            }
        }).then(function (isConfirm) {
            Swal.close();

        });
    }


    function nothing_to_compress() {


        var html = jQuery('#legacy-nothing-to-compress').html();

        Swal.fire({
            title: '',
            html: html,
            width: 650,
            confirmButtonColor: '#fdfdfd',
            confirmButtonText: 'Go Back',
            customClass: {
                container: 'no-padding-popup-bottom-bg nothing-to-do-popup',
            },
            showCancelButton: false,
            showConfirmButton: true,
            showCloseButton: false,
            allowOutsideClick: true,
            onBeforeOpen: () => {

            },
            onOpen: function () {

            }
        }).then(function (isConfirm) {
            Swal.close();

        });
    }

    function show_nocredits_dialog(credits, images, unit = 'KB') {

        var images = images.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        jQuery('p.ic-content-replace', '#legacy-no-credits').html('Purchase or allocate more credits to optimize your entire library, you’ll need at least ' + images + ' ' + unit + ', but only have ' + credits + ' ' + credit_unit + ' remaining.');
        var imgs = Math.round(credits);
        jQuery('.cta-btn-optimize-count', '#legacy-no-credits').html('Optimize (' + (imgs) + ') Images');


        if (credits == 0 || typeof credits == 'undefined') {
            jQuery('.cta-btn-optimize-count', '#legacy-no-credits').hide();
        }

        var html = jQuery('#legacy-no-credits').html();

        Swal.fire({
            title: '',
            html: html,
            width: 650,
            padding: 0,
            customClass: {
                container: 'no-credits-popup',
            },
            showCancelButton: false,
            showConfirmButton: false,
            cancelButtonColor: '#fdfdfd',
            confirmButtonColor: '#fdfdfd',
            confirmButtonText: 'Go to Manager',
            cancelButtonText: 'Optimize (' + credits + ') Images',
            allowOutsideClick: true,
            onBeforeOpen: () => {

            },
            onOpen: function () {
                var container = jQuery('.swal2-container');
                $('.cta-btn-optimize-count', container).on('click', function (e) {
                    e.preventDefault();

                    Swal.fire({
                        title: '',
                        html: jQuery('#legacy-compress-prepare').html(),
                        width: 650,
                        padding: 0,
                        customClass: {
                            container: 'no-padding-popup-bottom-bg',
                            cancelButton: 'close-white-text-bigger'
                        },
                        showConfirmButton: false,
                        showCancelButton: true,
                        cancelButtonColor: '#0091f6',
                        cancelButtonText: 'Stop',
                        allowOutsideClick: false,
                        onOpen: function () {

                            setTimeout(function () {
                                $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_compress_all', hash: Math.random().toString(36).substring(7)}, function (response) {
                                    if (response.success) {
                                        setTimeout(function () {
                                            Swal.close();
                                            window.location.reload();
                                        }, 2000);
                                    } else {
                                        alert('Oops! We weren\'t able to start the process! :(');
                                    }
                                });
                            }, 2000);

                        }
                    }).then(function (msg) {
                        // function when confirm button clicked
                        if (msg.dismiss == 'cancel') {
                            $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_all_stop', hash: Math.random().toString(36).substring(7)}, function (response) {
                                if (response.success) {
                                    setTimeout(function () {
                                        Swal.close();
                                        window.location.reload();
                                    }, 1000);
                                } else {
                                    alert('Oops! We weren\'t able to stop the process! :(');
                                }
                            });
                        }

                    }, function (dismiss) {
                    });

                    return false;
                });
            }
        }).then(function (isConfirm) {

            if (isConfirm.value == 'undefined') {
                // Compress all
            } else {
                // Go to Manager
                Swal.close();
                return false;
            }
        });
    }


    function show_compress_dialog() {
        Swal.fire({
            title: '',
            html: jQuery('#legacy-compress-all').html(),
            width: 650,
            padding: 0,
            customClass: {
                container: 'no-padding-popup ic-compress-all-popup',
            },
            showCancelButton: true,
            confirmButtonText: '<i class="ic-check"></i> Yes',
            cancelButtonText: '<i class="ic-cancel"></i> No',
            allowOutsideClick: false,
            onOpen: function () {

            }
        }).then(function (isConfirm) {
            if (isConfirm.value == true) {

                Swal.fire({
                    title: '',
                    html: jQuery('#legacy-compress-prepare').html(),
                    width: 650,
                    padding: 0,
                    customClass: {
                        container: 'no-padding-popup-bottom-bg',
                        cancelButton: 'close-white-text-bigger'
                    },
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonColor: '#0091f6',
                    cancelButtonText: 'Stop',
                    allowOutsideClick: false,
                    onOpen: function () {

                        setTimeout(function () {
                            $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_compress_all', hash: Math.random().toString(36).substring(7)}, function (response) {
                                if (response.success) {
                                    Swal.close();
                                    window.location.reload();
                                } else {
                                    alert('Oops! We weren\'t able to start the process! :(');
                                }
                            });
                        }, 2000);

                    }
                }).then(function (msg) {
                    // function when confirm button clicked
                    if (msg.dismiss == 'cancel') {
                        $.post(wps_ic_vars.ajaxurl, {action: 'wps_ic_legacy_all_stop', hash: Math.random().toString(36).substring(7)}, function (response) {
                            if (response.success) {
                                setTimeout(function () {
                                    Swal.close();
                                    window.location.reload();
                                }, 1000);
                            } else {
                                alert('Oops! We weren\'t able to stop the process! :(');
                            }
                        });
                    }

                }, function (dismiss) {
                });


            } else {
                return false;
            }
        });
    }


});